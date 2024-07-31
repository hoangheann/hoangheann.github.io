const baseUrl = 'https://qhfbkit-default-rtdb.asia-southeast1.firebasedatabase.app/';
const postCategorySelect = document.getElementById('post-category');
const postSelect = document.getElementById('post');
const postTitleInput = document.getElementById('post-title');
const postContentTextarea = document.getElementById('post-content');
const postImageInput = document.getElementById('post-image');
const postImagePreview = document.getElementById('post-image-preview');
const cmtList = document.getElementById('cmtList');
const addCommentBtn = document.getElementById('addComment');
const submitBtn = document.getElementById('submit');
const deletePostBtn = document.getElementById('deletePost');

// Fetch post categories
fetch(`${baseUrl}.json`)
    .then(response => response.json())
    .then(data => {
        postCategorySelect.innerHTML = '<option value="">Chọn danh mục</option>'
        for (const key in data) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = key;
            postCategorySelect.appendChild(option);
        }
    });

// Fetch posts when category changes
postCategorySelect.addEventListener('change', () => {
    const postKey = postCategorySelect.value;
    fetch(`${baseUrl}${postKey}.json`)
        .then(response => response.json())
        .then(data => {
            postSelect.innerHTML = '<option value="">Chọn bài đăng</option>';
            for (const key in data) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = key;
                postSelect.appendChild(option);
            }
        });
});

// Fetch post data when post changes
postSelect.addEventListener('change', () => {
    const postKey = postCategorySelect.value;
    const title = postSelect.value;
    fetch(`${baseUrl}${postKey}/${title}.json`)
        .then(response => response.json())
        .then(data => {
            postTitleInput.value = data.title || '';
            postContentTextarea.value = data.paragraph || '';

            // Clear previous images
            postImagePreview.innerHTML = '';
            if (data.images) {
                data.images.forEach((image, index) => {
                    const img = document.createElement('img');
                    img.src = image;
                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'Xóa';
                    deleteBtn.onclick = () => {
                        img.remove();
                        deleteBtn.remove();
                    };
                    postImagePreview.appendChild(img);
                    postImagePreview.appendChild(deleteBtn);
                });
            }

            // Clear previous comments
            cmtList.innerHTML = '';
            if (data.comments) {
                data.comments.forEach((comment, index) => {
                    addCommentHTML(index, comment[0], comment[1]);
                });
            }
        });
});

// Add new comment
addCommentBtn.addEventListener('click', () => {
    const index = cmtList.children.length;
    addCommentHTML(index);
});

function addCommentHTML(index, text = '', image = '') {
    const commentDiv = document.createElement('div');
    commentDiv.innerHTML = `
        <textarea rows=3 class="form-control">${text}</textarea>
        <input type="file" id="comment-image-${index}" accept="image/*">
        <div id="comment-image-preview-${index}" class="image-preview"></div>
        <button class="delete-comment-btn btn btn-danger mt-2">Xóa</button>
    `;
    cmtList.appendChild(commentDiv);

    if (image) {
        const imgPreview = commentDiv.querySelector(`#comment-image-preview-${index}`);
        const img = document.createElement('img');
        img.src = image;
        imgPreview.appendChild(img);
    }

    commentDiv.querySelector('.delete-comment-btn').addEventListener('click', () => {
        commentDiv.remove();
    });
}

// Save post
submitBtn.addEventListener('click', () => {
    const postKey = postCategorySelect.value;
    const title = postSelect.value;
    const postData = {
        title: postTitleInput.value,
        paragraph: postContentTextarea.value,
        images: Array.from(postImagePreview.querySelectorAll('img')).map(img => img.src),
        comments: Array.from(cmtList.children).map(commentDiv => [
            commentDiv.querySelector('textarea').value,
            commentDiv.querySelector('.image-preview img')?.src || ''
        ])
    };

    fetch(`${baseUrl}${postKey}/${title}.json`, {
        method: 'PUT',
        body: JSON.stringify(postData)
    })
    .then(() => alert('Post saved successfully!'))
    .catch(error => console.error('Error saving post:', error));
});

// Delete post
deletePostBtn.addEventListener('click', () => {
    const postKey = postCategorySelect.value;
    const title = postSelect.value;

    if (confirm('Are you sure you want to delete this post?')) {
        fetch(`${baseUrl}${postKey}/${title}.json`, {
            method: 'DELETE'
        })
        .then(() => {
            alert('Post deleted successfully!');
            postTitleInput.value = '';
            postContentTextarea.value = '';
            postImagePreview.innerHTML = '';
            cmtList.innerHTML = '';
            postSelect.remove(postSelect.selectedIndex);
        })
        .catch(error => console.error('Error deleting post:', error));
    }
});

// Handle image uploads
postImageInput.addEventListener('change', (event) => {
    const files = event.target.files;
    for (const file of files) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Xóa';
            deleteBtn.onclick = () => {
                img.remove();
                deleteBtn.remove();
            };
            postImagePreview.appendChild(img);
            postImagePreview.appendChild(deleteBtn);
        };
        reader.readAsDataURL(file);
    }
});