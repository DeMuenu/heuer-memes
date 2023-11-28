import fetch, JSON
import asyncio

async def load_post():
    print("sent")
    post_content = Element('password').element.value
    response = await fetch('http://127.0.0.1:5000/post', {
        'method': 'POST',
        'headers': {'Content-Type': 'application/json'},
        'body': JSON.stringify({'content': post_content})
    })

    
    
    new_post = f'<div><p>{post_content}</p></div>'
    Element('posts').element.innerHTML += new_post
    Element('password').element.value = ''  # Clear the input field
    print("no Responce")
    print(response)