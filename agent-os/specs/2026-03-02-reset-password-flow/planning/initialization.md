let's add a 'Forgot Password' link and design/build out the 'reset password' user flows. Supabase already sends out the 'reset password' email so we need a flow to handle that functionality.

###Questions & Answers

1. Your first assumption is correct. Under the password field and above the Sign In button.
2. Your first assumption is correct.
3. Yes please. Let's indicate the requirements of the password so that they match Supabase's requirements.
4. Let's send them back to the login page. Just to make sure they've saved the password somewhere and can retrieve it.
5. Yes, let's offer a resend email link along with the inline error messaging.
6. Let's use generic success messaging and add a bit of friction after a few login attempts.
7. This flow should behave identically for all roles

\*\* Note - Let's allow the user to toggle visibility on and off for the password fields.
