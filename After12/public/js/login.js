const hideAlert = () => {
  const el = document.querySelector('.alert');
  if(el) el.parentElement.removeChild(el);
}

const showAlert = (type, msg) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
}

const login = async (email, password) => {
  console.log(email, password)
  try{
    // a request to the REST API
    console.log(axios);
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/users/login',
      data: {
        email,
        password
      }
    });

    if(res.data.status === 'success') {
      showAlert('success', 'Logged in succesfully');
      window.setTimeout(()=>{
        location.assign('/')
      }, 1500)
    }
  } catch(err){
    showAlert('error', err.response.data.message);
  }
}

const logout = async() => {
  try{
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:8000/api/v1/users/logout'
    });
    if(res.data.status == "success") location.reload(true);
  } catch (err) {
    if (err.response) {
      console.log(err.response);  // Log the response error
    } else {
      console.log(err.message);  // Log other types of errors
    }
    showAlert('error', 'Error Logging out! Try again.')
  }
}


const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);


const saveButton = document.querySelector('.btn.btn--small.btn--green')

console.log(saveButton);



const userDataForm = document.querySelector('.form-user-data'); // sau document.querySelector
const userPasswordForm = document.querySelector('.form-user-pasword')

if (userDataForm) {
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    updateSettings({ name, email }, 'data');
  });
} else {
  console.log('Formularul nu a fost găsit!');
}

if (userDataForm) {
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings({ passwordCurrent, password, passwordConfirm }, 'password');

    document.getElementById('password-current').value='';
    document.getElementById('password').value='';
    document.getElementById('password-confirm').value='';
  });
} else {
  console.log('Formularul nu a fost găsit!');
}

// login router is protected
const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:8000/api/v1/users/updateMyPassword'
        : 'http://127.0.0.1:8000/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    showAlert('error', err.response);
  }
};