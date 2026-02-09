import { en } from 'vuetify/locale';


export default {
	$vuetify: en,

  auth: {
    login: 'Login',
    register: 'Register',
    username: 'Username',
    email: 'Email',
    password: 'Password',
    repeatPassword: 'Repeat Password',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    backToLogin: 'Back to Login'
  },

  navigation: {
    profiles: 'Profiles',
    integrations: 'Integrations',
    settings: 'Settings'
  },

  menu: {
    profiles: 'Profiles',
    logout: 'Logout'
  },

  validation: {
    required: 'Required',
    email: '{field} must be a valid email',
    min: '{field} must be at least {length} characters',
    confirmed: '{field} does not match',
    invalid: 'Invalid value'
  },

  settings: {
    allowRegistration: {
      title: 'New User Registration',
      description: 'Controls the ability for new users to register on the site'
    }
  }
}
