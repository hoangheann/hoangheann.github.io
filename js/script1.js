
function previewImages(input, previewContainer) {
  const container = document.getElementById(previewContainer);
  container.innerHTML = '';

  if (input.files) {
    [...input.files].forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'img-wrapper';

        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = 'preview-img';

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Xóa';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = function() {
          imgWrapper.remove();
          // Remove the file from input
          const dt = new DataTransfer();
          const { files } = input;
          for (let i = 0; i < files.length; i++) {
            if (index !== i)
              dt.items.add(files[i]);
          }
          input.files = dt.files;
        };

        imgWrapper.appendChild(img);
        imgWrapper.appendChild(deleteBtn);
        container.appendChild(imgWrapper);
      };
      reader.readAsDataURL(file);
    });
  }
}

// Function to add new comment fields
function addCommentFields() {
  const cmtList = document.getElementById('cmtList');
  const commentIndex = cmtList.children.length;

  const commentDiv = document.createElement('div');
  commentDiv.className = 'comment-item';
  commentDiv.innerHTML = `
    <textarea rows=3 class="form-control" placeholder="Comment ${commentIndex+1}"></textarea>
    <input type="file" id="comment-image-${commentIndex}" accept="image/*">
    <div id="comment-image-preview-${commentIndex}" class="image-preview"></div>
    <button class="delete-comment-btn">Xóa</button>
  `;

  cmtList.appendChild(commentDiv);

  // Add event listener for image upload
  const imageInput = commentDiv.querySelector(`#comment-image-${commentIndex}`);
  imageInput.addEventListener('change', function() {
    previewImages(this, `comment-image-preview-${commentIndex}`);
  });

  // Add event listener for delete button
  const deleteBtn = commentDiv.querySelector('.delete-comment-btn');
  deleteBtn.addEventListener('click', function() {
    commentDiv.remove();
  });
}

function previewImages(input, previewContainerId) {
  const container = document.getElementById(previewContainerId);
  container.innerHTML = '';

  if (input.files) {
    [...input.files].forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'img-wrapper';

        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = 'preview-img';

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Xóa';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = function() {
          imgWrapper.remove();
          // Remove the file from input
          const dt = new DataTransfer();
          const { files } = input;
          for (let i = 0; i < files.length; i++) {
            if (index !== i)
              dt.items.add(files[i]);
          }
          input.files = dt.files;
        };

        imgWrapper.appendChild(img);
        imgWrapper.appendChild(deleteBtn);
        container.appendChild(imgWrapper);
      };
      reader.readAsDataURL(file);
    });
  }
}

// Add event listener for the "THÊM (+)" button
document.addEventListener('DOMContentLoaded', function() {
  const addCommentBtn = Array.from(document.getElementsByTagName('button')).find(btn => btn.textContent.trim() === 'THÊM (+)');
  if (addCommentBtn) {
    addCommentBtn.addEventListener('click', addCommentFields);
  } else {
    console.error('Không tìm thấy nút "THÊM (+)"');
  }

  // Add event listener for post image upload
  const postImage = document.getElementById('post-image');
  if (postImage) {
    postImage.addEventListener('change', function() {
      previewImages(this, 'post-image-preview');
    });
  }
});

// Function to save data to Firebase
async function saveToFirebase() {
  const postKey = document.getElementById('post-category').value;
  const title = document.getElementById('post-title').value;
  const paragraph = document.getElementById('post-content').value;

  const postImages = document.getElementById('post-image').files;
  const commentList = document.querySelectorAll('#cmtList .comment-item');

  const postData = {
    title: title,
    paragraph: paragraph,
    images: [],
    comments: []
  };

  // Convert post images to base64
  for (let file of postImages) {
    const base64 = await getBase64(file);
    postData.images.push(base64);
  }

  // Process comments
  for (let comment of commentList) {
    const commentText = comment.querySelector('textarea').value;
    const commentImage = comment.querySelector('input[type="file"]').files[0];

    if (commentImage) {
      const base64 = await getBase64(commentImage);
      postData.comments.push([commentText, base64]);
    } else {
      postData.comments.push([commentText, '']);
    }
  }

  // Save to Firebase
  const url = `https://qhfbkit-default-rtdb.asia-southeast1.firebasedatabase.app/${postKey}/${title}.json`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      body: JSON.stringify(postData),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      alert('Đã lưu thành công!');
    } else {
      throw new Error('Lỗi khi lưu dữ liệu');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Có lỗi xảy ra khi lưu dữ liệu');
  }
}

// Function to convert image to base64
function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}


const url = 'https://script.google.com/macros/s/AKfycbwwPM7uAamqWqlWJJ012QfDfiAr48jpUZh0LRJX_l9JqFNvIHVHrwn1DYJvVsSCQUtY/exec';

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