document.getElementById("blog-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const title = document.getElementById("blog-title").value;
  const content = document.getElementById("blog-content").value;
  const timestamp = new Date().toLocaleString();

  if (title && content) {
    const blogPost = { title, content, timestamp };
    let posts = JSON.parse(localStorage.getItem("blogPosts")) || [];
    posts.push(blogPost);
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
      (post) => `
        <div class="blog-post mt-3 p-3 bg-dark text-light">
            <h4>${post.title}</h4>
            <small>${post.timestamp}</small>
            <p>${post.content}</p>
        </div>
    `
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", displayPosts);
