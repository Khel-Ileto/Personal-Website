document.getElementById("blog-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const title = document.getElementById("blog-title").value;
  const content = document.getElementById("blog-content").value;
  const timestamp = new Date().toLocaleString();

  if (title && content) {
    let posts = JSON.parse(localStorage.getItem("blogPosts")) || [];
    const editIndex = localStorage.getItem("editIndex");

    if (editIndex !== null) {
      // Update existing post
      posts[editIndex] = { title, content, timestamp };
      localStorage.removeItem("editIndex"); // Clear the temporary edit index
    } else {
      // Add new post
      const blogPost = { title, content, timestamp };
      posts.push(blogPost);
    }

    localStorage.setItem("blogPosts", JSON.stringify(posts));
    displayPosts();
    document.getElementById("blog-form").reset();
  }
});

function displayPosts() {
  const posts = JSON.parse(localStorage.getItem("blogPosts")) || [];
  const blogPostsContainer = document.getElementById("blog-posts");
  blogPostsContainer.innerHTML = posts
    .map(
      (post, index) => `
        <div class="blog-post mt-3 p-3 bg-dark text-light">
          <h4>${post.title}</h4>
          <small>${post.timestamp}</small>
          <p>${post.content}</p>
          <button class="btn btn-secondary btn-sm" onclick="editPost(${index})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deletePost(${index})">Delete</button>
        </div>
      `
    )
    .join("");
}

function editPost(index) {
  const posts = JSON.parse(localStorage.getItem("blogPosts"));
  const post = posts[index];
  document.getElementById("blog-title").value = post.title;
  document.getElementById("blog-content").value = post.content;

  // Store the index being edited
  localStorage.setItem("editIndex", index);
}

function deletePost(index) {
  let posts = JSON.parse(localStorage.getItem("blogPosts"));
  posts.splice(index, 1);
  localStorage.setItem("blogPosts", JSON.stringify(posts));
  displayPosts();
}

document.addEventListener("DOMContentLoaded", displayPosts);
