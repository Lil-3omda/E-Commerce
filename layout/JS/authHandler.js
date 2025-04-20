const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const userName= document.getElementById('userName').value.trim();
    const password=document.getElementById("password").value.trim();
    //CREATE HELPER FUNCTIOPN TO CHECK FILE BY FILE
    async function checkFile(filePath, role) {
        const respone= await fetch(filePath);
        const data= await respone.json();
        const user=data.find(user =>user.name ===userName && user.password === password);
        return user ?{...user, role} : null;
    }

    try{
        const [customer, seller, admin]= await Promise.all([
            checkFile('../../include/JsonFiles/admins.json', 'admin'),
            checkFile('../../include/JsonFiles/customers.json', 'customer'),
            checkFile('../../include/JsonFiles/sellers.json', 'seller')
        ]);
        const user= customer || seller || admin;
        if(user){
            localStorage.setItem("user", JSON.stringify(user));
            window.location.href=`../../${user.role}.html`;
        }else{
            alert("Invalid username or password");
        }
    }catch(error){
        console.error("Error fetching user data:", error);
        alert("An error occurred while logging in. Please try again later.");
    }
})