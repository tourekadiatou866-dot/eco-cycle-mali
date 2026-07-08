import { useState, useEffect, useMemo, useRef } from 'react';
import { Heart, MessageCircle, ImagePlus, Send, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import BottomNavigation from './BottomNavigation';
import './Community.css';

export default function Community() {
  const FEED_TIMEOUT_MS = 3000;
  const FEED_CACHE_KEY = 'community_feed_cache_v4';
  const activeFeedRequestRef = useRef(0);
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  }, []);
  const navigate = useNavigate();

  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [feedError, setFeedError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [hasLoadedFeedOnce, setHasLoadedFeedOnce] = useState(false);

  const isLoggedIn = Boolean(user?.id);
  const canPublish = postText.trim().length > 0 && !isPublishing;
  const STORAGE_BUCKET_CANDIDATES = ['post-images', 'posts', 'community-images', 'images'];

  const extractPostImageValue = (rawImage) => {
    if (!rawImage) return null;
    let imageValue = rawImage;

    if (typeof imageValue === 'string') {
      const trimmed = imageValue.trim();
      if (!trimmed) return null;

      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (typeof parsed === 'string') imageValue = parsed;
          else imageValue = parsed?.publicUrl || parsed?.url || parsed?.image || parsed?.path || null;
        } catch {
          imageValue = trimmed;
        }
      } else {
        imageValue = trimmed;
      }
    } else if (typeof imageValue === 'object') {
      imageValue = imageValue.publicUrl || imageValue.url || imageValue.image || imageValue.path || null;
    }

    if (!imageValue || typeof imageValue !== 'string') return null;
    const normalized = imageValue.trim();
    return normalized || null;
  };

  const resolvePostImage = async (rawImage) => {
    const normalized = extractPostImageValue(rawImage);
    if (!normalized) return null;

    if (normalized.startsWith('data:image/')) return normalized;
    const checkImageUrl = async (url) => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
      } catch {
        return false;
      }
    };

    const parseStorageUrl = (urlValue) => {
      try {
        const parsedUrl = new URL(urlValue);
        const publicPrefix = '/storage/v1/object/public/';
        const signPrefix = '/storage/v1/object/sign/';
        const pathname = parsedUrl.pathname || '';

        if (pathname.includes(publicPrefix)) {
          const tail = pathname.slice(pathname.indexOf(publicPrefix) + publicPrefix.length);
          const [bucket, ...rest] = tail.split('/');
          return { bucket, path: decodeURIComponent(rest.join('/')) };
        }

        if (pathname.includes(signPrefix)) {
          const tail = pathname.slice(pathname.indexOf(signPrefix) + signPrefix.length);
          const [bucket, ...rest] = tail.split('/');
          return { bucket, path: decodeURIComponent(rest.join('/')) };
        }
      } catch {
        return null;
      }
      return null;
    };

    const resolveFromStoragePath = async (pathValue, bucketHint = null) => {
      const cleanValue = (pathValue || '').replace(/^\/+/, '');
      if (!cleanValue) return null;

      const candidates = [];
      if (bucketHint) {
        candidates.push({ bucket: bucketHint, path: cleanValue });
      }

      if (cleanValue.includes('/')) {
        const [first, ...rest] = cleanValue.split('/');
        if (first && rest.length > 0) {
          candidates.push({ bucket: first, path: rest.join('/') });
        }
      }

      STORAGE_BUCKET_CANDIDATES.forEach((bucketName) => {
        if (cleanValue.startsWith(`${bucketName}/`)) {
          candidates.push({
            bucket: bucketName,
            path: cleanValue.slice(bucketName.length + 1)
          });
        } else {
          candidates.push({ bucket: bucketName, path: cleanValue });
        }
      });

      for (const candidate of candidates) {
        if (!candidate.bucket || !candidate.path) continue;
        const { data: signedData, error: signedError } = await supabase.storage
          .from(candidate.bucket)
          .createSignedUrl(candidate.path, 60 * 60 * 24 * 7);

        if (!signedError && signedData?.signedUrl) {
          const isReachable = await checkImageUrl(signedData.signedUrl);
          if (isReachable) return signedData.signedUrl;
        }

        const { data: publicData } = supabase.storage
          .from(candidate.bucket)
          .getPublicUrl(candidate.path);

        if (publicData?.publicUrl) {
          const isReachable = await checkImageUrl(publicData.publicUrl);
          if (isReachable) return publicData.publicUrl;
        }
      }

      return null;
    };

    if (normalized.startsWith('https://')) {
      const storageInfo = parseStorageUrl(normalized);
      if (!storageInfo?.path) return normalized;
      const resolvedUrl = await resolveFromStoragePath(storageInfo.path, storageInfo.bucket);
      return resolvedUrl || normalized;
    }
    if (normalized.startsWith('http://')) return normalized.replace('http://', 'https://');

    const resolvedUrl = await resolveFromStoragePath(normalized, null);
    return resolvedUrl || normalized;
  };

  const getActiveSessionUserId = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error(error);
      return null;
    }
    return data?.session?.user?.id || null;
  };

  useEffect(() => {
    let isMounted = true;
    activeFeedRequestRef.current += 1;
    const requestId = activeFeedRequestRef.current;

    const getCachedPosts = () => {
      try {
        const raw = localStorage.getItem(FEED_CACHE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    const fetchPosts = async () => {
      setShowLoadingIndicator(true);
      const cachedPosts = getCachedPosts();
      if (isMounted && cachedPosts.length > 0) {
        setPosts(cachedPosts);
        setLoadingPosts(false);
      }

      if (isMounted) {
        setLoadingPosts(cachedPosts.length === 0);
        setFeedError('');
      }
      const uiCutoffId = setTimeout(() => {
        if (!isMounted || activeFeedRequestRef.current !== requestId) return;
        setShowLoadingIndicator(false);
      }, FEED_TIMEOUT_MS);
      const loadingCutoffId = setTimeout(() => {
        if (!isMounted || activeFeedRequestRef.current !== requestId) return;
        setLoadingPosts(false);
        setFeedError('Connexion lente. Appuie sur Recharger.');
      }, FEED_TIMEOUT_MS);

      try {
        const { data, error } = await supabase
          .from('posts')
          .select(
            `
            id,
            content,
            image,
            created_at,
            user_id,
            user:profiles!posts_user_id_fkey (
              id,
              name,
              photo
            )
          `
          )
          .order('created_at', { ascending: false })
          .limit(10);

        if (!isMounted || activeFeedRequestRef.current !== requestId) return;

        if (error) {
          throw error;
        }

        const formattedPosts = (data || []).map((post) => ({
          ...post,
          image: extractPostImageValue(post.image),
          likes: 0,
          liked: false,
          comments: []
        }));

        if (isMounted) {
          setPosts(formattedPosts);
          localStorage.setItem(FEED_CACHE_KEY, JSON.stringify(formattedPosts));
          setLoadingPosts(false);
          setHasLoadedFeedOnce(true);
        }

        const postIds = formattedPosts.map((post) => post.id);
        if (postIds.length === 0) return;

        void (async () => {
          const resolvedEntries = await Promise.all(
            formattedPosts.map(async (post) => ({
              id: post.id,
              image: await resolvePostImage(post.image)
            }))
          );
          if (!isMounted || activeFeedRequestRef.current !== requestId) return;
          const resolvedMap = {};
          resolvedEntries.forEach((entry) => {
            resolvedMap[entry.id] = entry.image;
          });
          setPosts((prev) =>
            prev.map((post) => ({
              ...post,
              image: resolvedMap[post.id] || post.image
            }))
          );
        })();

        void (async () => {
          const [{ data: likesData, error: likesError }, { data: commentsData, error: commentsError }] = await Promise.all([
            supabase
              .from('post_likes')
              .select('post_id,user_id')
              .in('post_id', postIds),
            supabase
              .from('post_comments')
              .select(
                `
                post_id,
                id,
                text,
                user:profiles!post_comments_user_id_fkey (
                  name
                )
              `
              )
              .in('post_id', postIds)
              .order('created_at', { ascending: true })
          ]);

          if (!isMounted || activeFeedRequestRef.current !== requestId) return;
          if (likesError) console.error(likesError);
          if (commentsError) console.error(commentsError);

          const likesByPostId = {};
          const likedByUser = {};
          (likesData || []).forEach((like) => {
            likesByPostId[like.post_id] = (likesByPostId[like.post_id] || 0) + 1;
            if (like.user_id === user?.id) likedByUser[like.post_id] = true;
          });

          const commentsByPostId = {};
          (commentsData || []).forEach((comment) => {
            if (!commentsByPostId[comment.post_id]) {
              commentsByPostId[comment.post_id] = [];
            }
            commentsByPostId[comment.post_id].push({
              id: comment.id,
              author: comment.user?.name || 'Utilisateur',
              text: comment.text
            });
          });

          setPosts((prev) =>
            prev.map((post) => ({
              ...post,
              likes: likesByPostId[post.id] || 0,
              liked: Boolean(likedByUser[post.id]),
              comments: commentsByPostId[post.id] || post.comments
            }))
          );
        })();
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setFeedError('Chargement trop long. Appuie sur Recharger.');
          setHasLoadedFeedOnce(true);
        }
      } finally {
        clearTimeout(loadingCutoffId);
        clearTimeout(uiCutoffId);
        if (isMounted) {
          setShowLoadingIndicator(false);
          setLoadingPosts(false);
        }
      }
    };

    fetchPosts();
    return () => {
      isMounted = false;
    };
  }, [user?.id, reloadToken]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert("L'image est trop lourde (max 3 MB).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPostImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = async () => {
    if (!isLoggedIn) {
      alert('Veuillez vous connecter pour publier.');
      navigate('/login');
      return;
    }

    if (!postText.trim()) {
      alert('Veuillez écrire quelque chose.');
      return;
    }

    setIsPublishing(true);

    try {
      const sessionUserId = await getActiveSessionUserId();
      if (!sessionUserId) {
        alert('Session expirée. Reconnectez-vous pour publier.');
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: sessionUserId,
            content: postText.trim(),
            image: postImage
          }
        ])
        .select(
          `
          id,
          content,
          image,
          created_at,
          user_id,
          user:profiles!posts_user_id_fkey (
            id,
            name,
            photo
          )
        `
        )
        .single();

      if (error) {
        throw error;
      }

      const newPost = {
        ...data,
        image: await resolvePostImage(data.image),
        likes: 0,
        liked: false,
        comments: []
      };

      setPosts((prev) => [newPost, ...prev]);
      setPostText('');
      setPostImage(null);
    } catch (err) {
      console.error(err);
      alert(err?.message || "Échec de publication. Vérifie ta connexion puis réessaie.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleLike = async (postId) => {
    if (!isLoggedIn) {
      alert('Veuillez vous connecter pour liker.');
      navigate('/login');
      return;
    }

    const sessionUserId = await getActiveSessionUserId();
    if (!sessionUserId) {
      alert('Session expirée. Reconnectez-vous pour liker.');
      navigate('/login');
      return;
    }

    const currentPost = posts.find((post) => post.id === postId);
    if (!currentPost) return;

    const isLiking = !currentPost.liked;

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: isLiking,
              likes: isLiking ? post.likes + 1 : post.likes - 1
            }
          : post
      )
    );

    try {
      if (isLiking) {
        const { error } = await supabase
          .from('post_likes')
          .insert([{ post_id: postId, user_id: sessionUserId }]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .match({ post_id: postId, user_id: sessionUserId });
        if (error) throw error;
      }
    } catch (err) {
      console.error(err);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                liked: !isLiking,
                likes: !isLiking ? post.likes + 1 : post.likes - 1
              }
            : post
        )
      );
      alert('Impossible de mettre à jour le like.');
    }
  };

  const handleComment = async (postId) => {
    if (!isLoggedIn) {
      alert('Veuillez vous connecter pour commenter.');
      navigate('/login');
      return;
    }

    const sessionUserId = await getActiveSessionUserId();
    if (!sessionUserId) {
      alert('Session expirée. Reconnectez-vous pour commenter.');
      navigate('/login');
      return;
    }

    const text = commentText[postId]?.trim();
    if (!text) return;

    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert([{ post_id: postId, user_id: sessionUserId, text }])
        .select(
          `
          id,
          text,
          user:profiles!post_comments_user_id_fkey (
            name
          )
        `
        )
        .single();

      if (error) {
        throw error;
      }

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [
                  ...post.comments,
                  {
                    id: data.id,
                    author: data.user?.name || 'Utilisateur',
                    text: data.text
                  }
                ]
              }
            : post
        )
      );

      setCommentText((prev) => ({
        ...prev,
        [postId]: ''
      }));
    } catch (err) {
      console.error(err);
      alert("Impossible d'envoyer le commentaire.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!isLoggedIn) {
      alert('Veuillez vous connecter.');
      navigate('/login');
      return;
    }

    const sessionUserId = await getActiveSessionUserId();
    if (!sessionUserId) {
      alert('Session expirée. Reconnectez-vous pour supprimer.');
      navigate('/login');
      return;
    }

    const confirmDelete = window.confirm('Supprimer cette publication ?');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', sessionUserId);
      if (error) throw error;

      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (err) {
      console.error(err);
      alert('Suppression impossible.');
    }
  };

  const formatPostDate = (dateValue) => {
    if (!dateValue) return "Aujourd'hui";
    return new Date(dateValue).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="community-container">
      <div className="community-header">
        <h1>Communauté</h1>
        <p>Partagez vos actions écologiques et inspirez les autres.</p>
      </div>

      <div className="create-post">
        <textarea
          placeholder="Qu'avez-vous fait aujourd'hui pour l'environnement ?"
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          maxLength={500}
        />
        <div className="create-post-toolbar">
          <label className="image-input-label">
            <ImagePlus size={18} />
            Ajouter une image
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </label>
          <span className="char-counter">{postText.length}/500</span>
        </div>

        {postImage && (
          <img src={postImage} alt="Aperçu" className="preview-image" />
        )}

        <button className="publish-btn" onClick={handlePublish} disabled={!canPublish}>
          <Send size={18} />
          {isPublishing ? 'Publication...' : 'Publier'}
        </button>
      </div>

      <div className="posts-list">
        {showLoadingIndicator && <p className="community-state">Chargement des publications...</p>}
        {!loadingPosts && feedError && (
          <div className="community-state">
            <p>{feedError}</p>
            <button className="send-comment-btn" onClick={() => setReloadToken((prev) => prev + 1)}>
              Recharger
            </button>
          </div>
        )}

        {!showLoadingIndicator && hasLoadedFeedOnce && posts.length === 0 && !feedError && (
          <p className="community-state">Aucune publication pour le moment. Soyez la première personne à partager.</p>
        )}

        {posts.map((post) => {
          const isOwner = post.user_id === user?.id || post.user?.id === user?.id;
          const comments = Array.isArray(post.comments) ? post.comments : [];
          return (
            <div className="post-card" key={post.id}>
              <div className="post-header">
                <div className="post-user-info">
                  <img
                    src={
                      post.user?.photo ||
                      `https://ui-avatars.com/api/?name=${post.user?.name || 'Utilisateur'}&background=2E7D32&color=fff`
                    }
                    alt="Auteur"
                    className="post-avatar"
                  />
                  <div>
                    <h3>{post.user?.name || 'Utilisateur'}</h3>
                    <span>{formatPostDate(post.created_at)}</span>
                  </div>
                </div>

                {isOwner && (
                  <button className="delete-post-btn" onClick={() => handleDeletePost(post.id)}>
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <p className="post-content">{post.content}</p>

              {post.image && <img src={post.image} alt="Publication" className="post-image" />}

              <div className="post-actions">
                <button onClick={() => handleLike(post.id)} className={post.liked ? 'liked' : ''}>
                  <Heart size={18} fill={post.liked ? 'currentColor' : 'none'} />
                  {post.likes}
                </button>
                <button>
                  <MessageCircle size={18} />
                  {comments.length}
                </button>
              </div>

              <div className="comments-section">
                {comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <strong>{comment.author}</strong>
                    <p>{comment.text}</p>
                  </div>
                ))}

                <div className="comment-input-container">
                  <input
                    type="text"
                    placeholder="Ajouter un commentaire..."
                    value={commentText[post.id] || ''}
                    onChange={(e) =>
                      setCommentText((prev) => ({
                        ...prev,
                        [post.id]: e.target.value
                      }))
                    }
                  />
                  <button className="send-comment-btn" onClick={() => handleComment(post.id)}>
                    Envoyer
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <BottomNavigation activeTab="community" />
    </div>
  );
}