import { useEffect } from 'react';
import { signIn, getSession } from 'next-auth/client';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button } from 'react-bootstrap';

export default function SignIn() {
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
    const status = await signIn('credentials', {
      redirect: false,
      email: email,
      password: password,
    });

    if (status.error) {
      toast.error('Credentials does not match');
    } else {
      toast.success('User authenticated');
      router.replace('/');
    }
    
  };

  return (
    <main className="form-signin">
      <form onSubmit={onFormSubmit}>
        <h1 className="h3 mb-3 fw-normal text-center mb-4">Signin</h1>

        <div className="form-floating">
          <input type="email" className="form-control" id="floatingInput" placeholder="name@example.com" name="email" />
          <label htmlFor="floatingInput">Email address</label>
        </div>

        <div className="form-floating">
          <input type="password" className="form-control" id="floatingPassword" placeholder="Password" name="password" />
          <label htmlFor="floatingPassword">Password</label>
        </div>

        <button className="w-100 btn btn-lg btn-primary" type="submit">Sign in</button>
        <Link href="/auth/signup">
          <Button variant="link" className="w-100 btn btn-lg">
            Sign up
          </Button>
        </Link>
      </form>
    </main>
  )
}