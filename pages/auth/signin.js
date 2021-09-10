export default function SignIn() {

  const onFormSubmit = async (e) => {
    e.preventDefault();
    //Getting value from useRef()
    const email = e.target.email.value;
    const password = e.target.password.value;
    //Validation
    if (!email || !email.includes('@') || !password) {
      alert('Invalid details');
      return;
    }
    //POST form values
    const status = await signIn('credentials', {
      redirect: false,
      email: email,
      password: password,
    });
    
    //Await for data for any desirable next steps
    const data = await res.json();
    console.log(data);
  };

  return (
    <main className="form-signin">
      <form onSubmit={onFormSubmit}>
        <h1 className="h3 mb-3 fw-normal text-center mb-4">Create an account</h1>

        <div className="form-floating">
          <input type="email" className="form-control" id="floatingInput" placeholder="name@example.com" name="email" />
          <label htmlFor="floatingInput">Email address</label>
        </div>

        <div className="form-floating">
          <input type="password" className="form-control" id="floatingPassword" placeholder="Password" name="password" />
          <label htmlFor="floatingPassword">Password</label>
        </div>

        <div className="form-floating mb-4">
          <input type="password" className="form-control" id="floatingRepeatPassword" placeholder="Password" name="passwordRepeat" />
          <label htmlFor="floatingRepeatPassword">Repeat Paswword</label>
        </div>

        <button className="w-100 btn btn-lg btn-primary" type="submit">Sign up</button>
        <button className="w-100 btn btn-lg btn-link">Sign in</button>
      </form>
    </main>
  )
}