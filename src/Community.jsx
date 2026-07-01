import React, { useState, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Image,
  Send,
  Trash2
} from 'lucide-react';
import BottomNavigation from './BottomNavigation';
import './Community.css';
import { supabase } from './supabaseClient';

export default function Community() {

  const user = JSON.parse(localStorage.getItem('user'));

  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [commentText, setCommentText] = useState({});
 const defaultPosts = [];

const [posts, setPosts] = useState([]);

useEffect(() => {
  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          image,
          created_at,
          user_id,
          user:profiles (
            id,
            name,
            photo
          ),
          likes:post_likes (
            user_id
          ),
          comments:post_comments (
            id,
            text,
            created_at,
            user:profiles (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      const formattedPosts = data.map(post => {
        const likesArray = post.likes || [];
        const liked = likesArray.some(like => like.user_id === user?.id);
        const commentsArray = (post.comments || []).map(comment => ({
          id: comment.id,
          author: comment.user?.name || 'Utilisateur',
          text: comment.text
        }));

        return {
          ...post,
          likes: likesArray.length,
          liked,
          comments: commentsArray
        };
      });

      setPosts(formattedPosts);
    } catch (err) {
      console.error(err);
    }
  };

  fetchPosts();
}, [user?.id]);

useEffect(() => {
  localStorage.setItem(
    'communityPosts',
    JSON.stringify(posts)
  );
}, [posts]);

const handleImageChange = (e) => {

  const file = e.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onloadend = () => {
    setPostImage(reader.result);
  };

  reader.readAsDataURL(file);
};
  const handlePublish = async () => {
    if (!postText.trim()) {
      alert('Veuillez écrire quelque chose');
      return;
    }

    try {
      const newPostData = {
        user_id: user.id,
        content: postText,
        image: postImage
      };

      const { data, error } = await supabase
        .from('posts')
        .insert([newPostData])
        .select(`
          id,
          content,
          image,
          created_at,
          user_id,
          user:profiles (
            id,
            name,
            photo
          )
        `)
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      const newPost = {
        ...data,
        likes: 0,
        liked: false,
        comments: []
      };

      setPosts([newPost, ...posts]);
      setPostText('');
      setPostImage(null);
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la publication');
    }
  };

  const handleLike = async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post || !user?.id) return;

    const isLiking = !post.liked;

    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          liked: isLiking,
          likes: isLiking ? p.likes + 1 : p.likes - 1
        };
      }
      return p;
    }));

    try {
      if (isLiking) {
        const { error } = await supabase
          .from('post_likes')
          .insert([{ post_id: postId, user_id: user.id }]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .match({ post_id: postId, user_id: user.id });
        if (error) throw error;
      }
    } catch (err) {
      console.error(err);
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            liked: !isLiking,
            likes: !isLiking ? p.likes + 1 : p.likes - 1
          };
        }
        return p;
      }));
    }
  };

  const handleComment = async (postId) => {
    const text = commentText[postId]?.trim();
    if (!text || !user?.id) return;

    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert([{ post_id: postId, user_id: user.id, text }])
        .select(`
          id,
          text,
          created_at,
          user:profiles (
            name
          )
        `)
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [
              ...post.comments,
              {
                id: data.id,
                author: data.user?.name || 'Utilisateur',
                text: data.text
              }
            ]
          };
        }
        return post;
      }));

      setCommentText({
        ...commentText,
        [postId]: ''
      });
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'envoi du commentaire');
    }
  };

  const handleDeletePost = async (postId) => {
    const confirmDelete = window.confirm(
      'Voulez-vous vraiment supprimer cette publication ?'
    );
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) {
        alert(error.message);
        return;
      }

      setPosts(posts.filter(post => post.id !== postId));
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression');
    }
  };
  return (
    <div className="community-container">

      <div className="community-header">
        <h1>Communauté</h1>
        <p>Partagez vos actions écologiques 🌿</p>
      </div>

      {/* Zone de publication */}

      <div className="create-post">

        <textarea
          placeholder="Qu'avez-vous fait aujourd'hui pour l'environnement ?"
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
        />
<input
  type="file"
  accept="image/*"
  onChange={handleImageChange}
/>

{postImage && (
  <img
    src={postImage}
    alt=""
    className="preview-image"
  />
)}
        <button
          className="publish-btn"
          onClick={handlePublish}
        >
          <Send size={18} />
          Publier
        </button>

      </div>

      {/* Publications */}

      <div className="posts-list">

        {posts.map(post => (

          <div className="post-card" key={post.id}>

            <div className="post-header">

  <div className="post-user-info">

    
      <img
  src={
  post.user?.photo ||
  `https://ui-avatars.com/api/?name=${
    post.user?.name || 'Utilisateur'
  }`
}
  alt=""
  className="post-avatar"
/>
    

    <div>
      <h3>
  {post.user?.name || post.author}
</h3>
     <span>
  {post.created_at
    ? new Date(post.created_at).toLocaleString('fr-FR')
    : 'Aujourd’hui'}
</span>
    </div>

  </div>

  {post.author === user?.name && (
    <button
      className="delete-post-btn"
      onClick={() => handleDeletePost(post.id)}
    >
      <Trash2 size={18} />
    </button>
  )}

</div>

            <p className="post-content">
              {post.content}
            </p>
{post.image && (
  <img
    src={post.image}
    alt=""
    className="post-image"
  />
)}
            <div className="post-actions">

              <button
                onClick={() => handleLike(post.id)}
              >
                <Heart
                  size={18}
                  fill={post.liked ? 'red' : 'none'}
                  color={post.liked ? 'red' : '#666'}
                />
                {post.likes}
              </button>

             <button>
  <MessageCircle size={18} />
  {Array.isArray(post.comments)
    ? post.comments.length
    : 0}
</button>

            </div>
            <div className="comments-section">

  {(Array.isArray(post.comments)
  ? post.comments
  : []).map(comment => (
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
        setCommentText({
          ...commentText,
          [post.id]: e.target.value
        })
      }
    />

    <button
      className="send-comment-btn"
      onClick={() => handleComment(post.id)}
    >
      Envoyer
    </button>

  </div>

</div>

          </div>

        ))}

      </div>

      <BottomNavigation activeTab="community" />

    </div>
  );
}