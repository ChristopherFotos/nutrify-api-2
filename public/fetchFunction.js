document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    // Stores the user-provided credentiols an an object
    const data = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    }
    // Sends the user-provided credentials to the user/login route
    const response = await fetch('http://localhost:3000/user/login', {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    // Recieves the response, converts it to JSON, and saves the token in localStorage 
    const JSONresponse = await response.json()
    console.log(JSONresponse)
    localStorage.token = JSONresponse.token

    // Redirect the user to their dashboard
})