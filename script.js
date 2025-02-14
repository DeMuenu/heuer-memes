/*************************************************************/
/* Global or shared variables (if you want them for both)    */
/*************************************************************/
const ipPortStories = 'data.heuer-memes.ch:8443'; // For Website One
const ipReviews = 'https://data.heuer-memes.ch';
const ipPortReviews = 'https://data.heuer-memes.ch:8443';

/*************************************************************/
/*                   Website One: Heuer-Stories              */
/*************************************************************/
function initHeuerStories() {
    const storiesPage = document.getElementById('heuer-stories-page');
    if (!storiesPage) {
      // Not on Heuer-Stories, so do nothing
      return;
    }
  const loginForm = document.getElementById('login');
  const sendForm = document.getElementById('send');
  const postButtonPW = document.getElementById('post-buttonPW');
  const postButton = document.getElementById('post-button');
  const postsDiv = document.getElementById('posts');
  const passwordInput = document.getElementById('password');
  const tweetInput = document.getElementById('tweet-input');
  const tweetTitleInput = document.getElementById('tweet-titel');

  if (!loginForm || !sendForm || !postButtonPW || !postButton) {
    // Not on Heuer-Stories page, do nothing
    return;
  }

  // Hide the send form by default
  sendForm.style.display = 'none';

  // Post a new tweet/story
  async function postTweet() {
    const tweet = tweetInput.value.trim();
    const pw = passwordInput.value.trim();
    const tweetTitle = tweetTitleInput.value.trim();

    if (!tweet || !pw || !tweetTitle) {
      console.log('All fields (password, title, tweet) are required!');
      return;
    }

    const headers = { 'Content-Type': 'application/json' };
    const body = JSON.stringify({ tweetTitle: tweetTitle, tweet: tweet, password: pw });

    try {
      const response = await fetch(`https://${ipPortStories}/post_tweet`, {
        method: 'POST',
        headers,
        body
      });
      if (response.ok) {
        console.log('Posted tweet/story successfully');
        await fetchTweets(); // Refresh list
      } else {
        console.error('Failed to post tweet/story');
      }
    } catch (err) {
      console.error('Error posting tweet/story:', err);
    }

    tweetInput.value = '';
    tweetTitleInput.value = '';
  }

  // Fetch and display tweets/stories
  async function fetchTweets() {
    const pw = passwordInput.value.trim();
    postsDiv.innerHTML = '';

    const headers = { Authorization: pw };
    try {
      const response = await fetch(`https://${ipPortStories}/get_tweets`, {
        method: 'GET',
        headers
      });
      if (!response.ok) {
        console.error('Failed to fetch tweets/stories');
        return;
      }
      const data = await response.json();

      // Hide password field, show "Refresh" label on button
      passwordInput.style.display = 'none';
      postButtonPW.innerText = 'Refresh Posts';

      // If password starts with 'g', show the form to allow posting
      if (pw && pw[0] === 'g') {
        sendForm.style.display = 'block';
      }

      // Clear existing
      postsDiv.innerHTML = '';

      // Build HTML for each post
      data.forEach(post => {
        const title = post.title;
        const text = post.text;
        const writtenBy = post.by;

        const postHTML = `
          <div>
            <b>${title}</b>
            <p>${text}</p>
            <h6 style="color: lightblue;">Gepostet von ${writtenBy}</h6>
          </div>
        `;
        // Prepend to the top
        postsDiv.innerHTML = postHTML + postsDiv.innerHTML;
      });
    } catch (err) {
      console.error('Error fetching tweets/stories:', err);
    }
  }

  // Event listeners
  postButtonPW.addEventListener('click', fetchTweets);
  postButton.addEventListener('click', postTweet);
}

/*************************************************************/
/*                   Website Two: Heuer-Reviews              */
/*************************************************************/
function initHeuerReviews() {
    const reviewsPage = document.getElementById('heuer-reviews-page');
    if (!reviewsPage) {
        // Not on Heuer-Reviews, so do nothing
        return;
    }
    console.log(">> initHeuerReviews is running on this page <<");
  const loginForm = document.getElementById('login');
  const pwForm = document.getElementById('PW');
  const sendForm = document.getElementById('send');
  const pwLockButton = document.getElementById('PWlock');
  const refreshButton = document.getElementById('post-buttonPW');
  const postButton = document.getElementById('post-button-Review');
  const passwordInput = document.getElementById('password');
  const fileInput = document.getElementById('fileInput');
  const postsDiv = document.getElementById('posts');

  if (!loginForm || !pwForm || !sendForm || !pwLockButton) {
    // Not on Heuer-Reviews page, do nothing
    return;
  }

  // By default, hide the send form
  sendForm.style.display = 'none';

  // Upload an image (called "post_tweet" in the original PyScript)
  async function uploadReviewImage() {
    const reviewsPage = document.getElementById('heuer-reviews-page');
    if (!reviewsPage) {
      // Not on Heuer-Reviews, so do nothing
      return;
    }
    const pw = passwordInput.value.trim();
    if (!fileInput.files || fileInput.files.length === 0) {
      console.log('No file selected');
      return;
    }
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    const headers = { Authorization: pw };

    try {
      const response = await fetch(`${ipPortReviews}/post_review`, {
        method: 'POST',
        headers: headers,
        body: formData
      });
      if (response.ok) {
        console.log('Image uploaded successfully!');
        await fetchReviews();
      } else {
        console.error('Failed to upload image (wrong password or server error).');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
    }
  }

  // Post a new comment and star rating
  async function postReview(filename) {
    // filename in the DOM is sanitized (replaced '.' or etc.)
    const commentInput = document.getElementById(`comment-input-${filename}`);
    const starInput = document.getElementById(`sterne-input-${filename}`);
    if (!commentInput || !starInput) return;

    const comment = commentInput.value.trim();
    const stars = starInput.value.trim();
    const pw = passwordInput.value.trim();

    if (!comment || !pw || !stars) {
      console.log('All fields (password, comment, stars) required!');
      return;
    }

    const body = {
      tweetTitle: filename,
      tweet: comment,
      password: pw,
      stars: stars
    };

    try {
      const response = await fetch(`${ipPortReviews}/post_comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        console.log('Comment posted successfully!');
        // Clear the input
        commentInput.value = '';
        await fetchReviews();
      } else {
        console.error('Failed to post comment (maybe wrong password).');
      }
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  }

  // Fetch all reviews (images + their comments)
  async function fetchReviews() {
    try {
      const response = await fetch(`${ipPortReviews}/get_reviews`, { method: 'GET' });
      if (!response.ok) {
        console.error('Failed to fetch reviews.');
        return;
      }
      const data = await response.json();
      postsDiv.innerHTML = '';
      refreshButton.innerText = 'Refresh Posts';

      data.forEach(item => {
        const rawFilename = item.filename; // e.g. 'image.png'
        // Create an ID-safe version of the filename for DOM usage
        const safeFilename = rawFilename.replace('.png', '').replace(/\./g, '_');
        const url = `${ipReviews}/${rawFilename}`;

        // If user has entered a password, show comment input
        let commentBoxHTML = '';
        const pw = passwordInput.value.trim();
        if (pw) {
          commentBoxHTML = `
            <input type='number' id='sterne-input-${safeFilename}' placeholder='Sterne (1-5)'>
            <input type='text' id='comment-input-${safeFilename}' placeholder='Add a comment...'>
            <button onclick="postReview('${safeFilename}')">Comment</button>
          `;
        }

        // Build the main container for the image + comments
        let reviewHTML = `
          <div>
            <div><img src="${url}" alt="Review Image" style="max-width:100%; max-height:500px;"></div>
            <div id="comments-${safeFilename}" class="comments"></div>
            ${commentBoxHTML}
          </div>
        `;

        // Append (or prepend) to the container
        postsDiv.innerHTML = reviewHTML + postsDiv.innerHTML;

        // Display existing reviews (stars + comment text)
        const commentsDiv = document.getElementById(`comments-${safeFilename}`);
        (item.reviews || []).forEach(review => {
          if (review && review.length === 2) {
            // review[0] is comment, review[1] is star number
            const starCount = parseInt(review[1], 10);
            let starString = '';
            for (let i = 0; i < 5; i++) {
              if (i < starCount) {
                starString += `<span class="fa fa-star checked" style="color: orange; margin-right:5px;"></span>`;
              } else {
                starString += `<span class="fa fa-star" style="margin-right:5px;"></span>`;
              }
            }
            commentsDiv.innerHTML += `
              <div class="comments">
                ${starString}
                <p>${review[0]}</p>
              </div>
            `;
          }
        });
      });
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  }

  // Lock password => show the "send" form
  function pwLock() {
    pwForm.style.display = 'none';
    sendForm.style.display = 'block';
    fetchReviews();
  }

  // Event Listeners for second website
  refreshButton.addEventListener('click', fetchReviews);
  postButton.addEventListener('click', uploadReviewImage);
  pwLockButton.addEventListener('click', pwLock);

  // Expose postReview to the window so we can call it in the inline onclick
  window.postReview = postReview;

  // On page load, fetch reviews
  fetchReviews();
}



/*************************************************************/
function initHeuerKunst() {
    const kunstPage = document.getElementById('heuer-kunst-page');
    if (!kunstPage) {
      // Not on Heuer-Kunst, so do nothing
      return;
    }
    console.log(">> initHeuerKunst is running on this page <<");
    // Check if we are on the Heuer-Kunst page by looking for a known element
    const loginForm = document.getElementById('login');
    const pwForm = document.getElementById('PW');
    const sendForm = document.getElementById('send');
    const pwLockButton = document.getElementById('PWlock');
    const refreshButton = document.getElementById('post-buttonPW');
    const postButton = document.getElementById('post-button-Art');
    const passwordInput = document.getElementById('password');
    const fileInput = document.getElementById('fileInput');
    const postsDiv = document.getElementById('posts');
  
    if (!loginForm || !pwForm || !sendForm || !pwLockButton) {
      // If these elements aren't found, we're not on the Heuer-Kunst page.
      return;
    }
  
    // Endpoints for Heuer-Kunst (slightly different from Reviews):
    const ipKunst = 'https://data.heuer-memes.ch';
    const ipPortKunst = 'https://data.heuer-memes.ch:8443';
  
    // By default, hide the send form
    sendForm.style.display = 'none';
  
    /*************************************************************/
    /*             Upload (post_tweet) => AI Image               */
    /*************************************************************/
    async function uploadAiImage() {
      const kunstPage = document.getElementById('heuer-kunst-page');
      if (!kunstPage) {
        // Not on Heuer-Kunst, so do nothing
        return;
      }
      const pw = passwordInput.value.trim();
      if (!fileInput.files || fileInput.files.length === 0) {
        console.log('No file selected');
        return;
      }
  
      const formData = new FormData();
      formData.append('file', fileInput.files[0]);
      const headers = { Authorization: pw };
  
      try {
        const response = await fetch(`${ipPortKunst}/post_ai`, {
          method: 'POST',
          headers: headers,
          body: formData,
        });
        if (response.ok) {
          console.log('File uploaded successfully!');
          await fetchAi();
        } else {
          console.error('Failed to upload file (wrong password or server error).');
        }
      } catch (err) {
        console.error('Error uploading file:', err);
      }
    }
  
    /*************************************************************/
    /*      Post a comment & star rating => (post_review)        */
    /*************************************************************/
    async function postAiComment(filename) {
      // Example: filename is the "title" from the Python code
      const commentInput = document.getElementById(`comment-input-${filename}`);
      const starInput = document.getElementById(`sterne-input-${filename}`);
      if (!commentInput || !starInput) return;
  
      const comment = commentInput.value.trim();
      const stars = starInput.value.trim();
      const pw = passwordInput.value.trim();
  
      if (!comment || !pw || !stars) {
        console.log('All fields (password, comment, stars) are required!');
        return;
      }
  
      const body = {
        tweetTitle: filename,
        tweet: comment,
        password: pw,
        stars: stars,
      };
  
      try {
        const response = await fetch(`${ipPortKunst}/post_aicomment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (response.ok) {
          console.log('Comment posted successfully!');
          // Clear the input
          commentInput.value = '';
          await fetchAi();
        } else {
          console.error('Failed to post AI comment (maybe wrong password).');
        }
      } catch (err) {
        console.error('Error posting AI comment:', err);
      }
    }
  
    /*************************************************************/
    /*           Fetch AI posts => (fetch_tweets)                */
    /*************************************************************/
    async function fetchAi() {
      try {
        const response = await fetch(`${ipPortKunst}/get_ai`, { method: 'GET' });
        if (!response.ok) {
          console.error('Failed to fetch AI images.');
          return;
        }
        const data = await response.json();
        postsDiv.innerHTML = '';
        refreshButton.innerText = 'Refresh Posts';
  
        data.forEach(item => {
          const rawFilename = item.filename; // e.g. 'image.png'
          // Create an ID-safe version of the filename for DOM usage
          const safeFilename = rawFilename.replace('.png', '').replace(/\./g, '_');
          const url = `${ipKunst}/${rawFilename}`;
  
          // Check if user has a password => show comment input
          const pw = passwordInput.value.trim();
          let commentBoxHTML = '';
          if (pw) {
            commentBoxHTML = `
              <input type='number' id='sterne-input-${safeFilename}' placeholder='Wieviel von 5 Sternen'>
              <input type='text' id='comment-input-${safeFilename}' placeholder='Add a comment...'>
              <button onclick="postAiComment('${safeFilename}')">Comment</button>
            `;
          }
  
          // Check if "SimuWarning" applies
          let simuWarning = '';
          if (item.isSimu === true) {
            simuWarning = `<p style="color:red;">Achtung, Propaganda der Obrigkeit!</p>`;
          }
  
          // Build the main container
          const newPostHTML = `
            <div>
              ${simuWarning}
              <div><img src="${url}" alt="AI Image" style="max-width:100%; max-height:500px;"></div>
              <div id="comments-${safeFilename}" class="comments"></div>
              ${commentBoxHTML}
            </div>
          `;
  
          // Prepend to show the newest at the top
          postsDiv.innerHTML = newPostHTML + postsDiv.innerHTML;
  
          // Display existing reviews (stars + comment text)
          const commentsDiv = document.getElementById(`comments-${safeFilename}`);
          (item.reviews || []).forEach(review => {
            if (review && review.length === 2) {
              // review[0] is comment, review[1] is star number
              const starCount = parseInt(review[1], 10);
              let starString = '';
              for (let i = 0; i < 5; i++) {
                if (i < starCount) {
                  starString += `<span class="fa fa-star checked" style="color: orange; margin-right:5px;"></span>`;
                } else {
                  starString += `<span class="fa fa-star" style="margin-right:5px;"></span>`;
                }
              }
              commentsDiv.innerHTML += `
                <div class="comments">
                  ${starString}
                  <p>${review[0]}</p>
                </div>
              `;
            }
          });
        });
      } catch (err) {
        console.error('Error fetching AI data:', err);
      }
    }
  
    /*************************************************************/
    /*                Lock Password => (PWlock)                  */
    /*************************************************************/
    function pwLock() {
      pwForm.style.display = 'none';
      sendForm.style.display = 'block';
      fetchAi();
    }
  
    // Attach listeners
    refreshButton.addEventListener('click', fetchAi);
    postButton.addEventListener('click', uploadAiImage);
    pwLockButton.addEventListener('click', pwLock);
  
    // Expose the comment function to the global scope for inline onclick
    window.postAiComment = postAiComment;
  
    // On page load, fetch the existing AI data
    fetchAi();
  }
  
/*************************************************************/
/*             Initialization for Each Page                  */
/*************************************************************/
document.addEventListener('DOMContentLoaded', () => {
  initHeuerStories();
  initHeuerReviews();
  initHeuerKunst(); 
});
