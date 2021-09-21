import { useEffect } from 'react';
import { getSession } from 'next-auth/client';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button } from 'react-bootstrap';

export default function SignUp() {
  const router = useRouter();

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        router.replace('/');
      } else {
        console.log('Not logged in');
      }
    });
  }, []);
  
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
    let res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });
    //Await for data for any desirable next steps
    res = await res.json();

    if (!res && res.error) {
      toast.error('Credentials does not match');
    } else {
      toast.success('User authenticated');
      router.replace('/auth/signin');
    }
  };

  return (
    <main className="form-signin">
      <form onSubmit={onFormSubmit}>
        <h1 className="h3 mb-3 fw-normal text-center mb-4">Create an account</h1>

        <div className="form-floating">
          <input type="text" className="form-control" id="signup-username" placeholder="JohnDoe95" name="username" />
          <label htmlFor="signup-username">Username</label>
        </div>

        <div className="form-floating">
          <input type="email" className="form-control" id="signup-email" placeholder="name@example.com" name="email" />
          <label htmlFor="signup-email">Email address</label>
        </div>

        <div className="form-floating">
          <input type="password" className="form-control" id="signup-password" placeholder="Password" name="password" />
          <label htmlFor="signup-password">Password</label>
        </div>

        <div className="form-floating mb-4">
          <input type="password" className="form-control" id="signup-password-repeat" placeholder="Password" name="passwordRepeat" />
          <label htmlFor="signup-password-repeat">Repeat Paswword</label>
        </div>

        <button className="w-100 btn btn-lg btn-primary" type="submit">Sign up</button>
        <Link href="/auth/signin">
          <Button variant="link" className="w-100 btn btn-lg">
            Sign in
          </Button>
        </Link>
      </form>
    </main>
  )
}