const baseUrl = 'https://qhfbkit-default-rtdb.asia-southeast1.firebasedatabase.app/';
const postCategorySelect = document.getElementById('post-category');
// const postSelect = document.getElementById('post');
const postTitleInput = document.getElementById('post-title');
const postContentTextarea = document.getElementById('post-content');
const postImageInput = document.getElementById('post-image');
const postImagePreview = document.getElementById('post-image-preview');
const cmtList = document.getElementById('cmtList');
const addCommentBtn = document.getElementById('addComment');
const submitBtn = document.getElementById('submit');
const deletePostBtn = document.getElementById('deletePost');


// Add new comment
addCommentBtn.addEventListener('click', () => {
    const index = cmtList.children.length;
    addCommentHTML(index);
});

// function addCommentHTML(index, text = '', image = '') {
//     const commentDiv = document.createElement('div');
//     commentDiv.innerHTML = `
//         <textarea rows=3 class="form-control">${text}</textarea>
//         <input type="file" id="comment-image-${index}" accept="image/*">
//         <div id="comment-image-preview-${index}" class="image-preview"></div>
//         <button class="delete-comment-btn btn btn-danger mt-2">Xóa</button>
//     `;
//     cmtList.appendChild(commentDiv);

//     if (image) {
//         const imgPreview = commentDiv.querySelector(`#comment-image-preview-${index}`);
//         const img = document.createElement('img');
//         img.src = image;
//         imgPreview.appendChild(img);
//     }

//     commentDiv.querySelector('.delete-comment-btn').addEventListener('click', () => {
//         commentDiv.remove();
//     });
// }



function addCommentHTML(index, text = '', image = '') {
    const commentDiv = document.createElement('div');
    commentDiv.innerHTML = `
        <textarea placeholder="Comment..." rows=2 class="form-control">${text}</textarea>
        <input type="file" id="comment-image-${index}" accept="image/*" class="comment-image-input">
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

    const commentImageInput = commentDiv.querySelector(`#comment-image-${index}`);
    commentImageInput.addEventListener('change', (event) => {
        handleImageUpload(event, `#comment-image-preview-${index}`);
    });

    commentDiv.querySelector('.delete-comment-btn').addEventListener('click', () => {
        commentDiv.remove();
    });
}
function handleImageUpload(event, previewSelector) {
    const files = event.target.files;
    const previewElement = document.querySelector(previewSelector);

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
            previewElement.appendChild(img);
            previewElement.appendChild(deleteBtn);
        };
        reader.readAsDataURL(file);
    }
}



// Save post
submitBtn.addEventListener('click', () => {
    const postKey = postCategorySelect.value;
    const title = postTitleInput.value;
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


const url = 'https://script.google.com/macros/s/AKfycbzIYH1W-7MxJ7hhVkK643jXB7yB9eWXCRoUqXpQCvxVxnHjLiFGmBtKaRxHtoef33H7/exec';

function transformData(jsonData) {
  const result = {};
  jsonData.forEach(item => {
    const category = item[2];
    const url = item[1].replace('https://www.facebook.com', '');
    if (!result[category]) {
      result[category] = [];
    }
    result[category].push(url);
  });
  return result;
}

function createOptions(data) {
  const select = document.getElementById('post-category'); // Giả sử bạn có một thẻ select với id là 'post-category'
  select.innerHTML = ''; // Xóa các option hiện có

  // Tạo option mặc định
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Chọn danh mục';
  defaultOption.selected = true;
  defaultOption.disabled = true;
  select.appendChild(defaultOption);

  // Tạo các option từ data
  Object.keys(data).forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = key;
    select.appendChild(option);
  });
}

fetch(url)
  .then(response => response.json())
  .then(data => {
    const transformedData = transformData(data);
    console.log(JSON.stringify(transformedData, null, 2));
    createOptions(transformedData);
  })
  .catch(error => console.error('Error:', error));
