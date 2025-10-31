# Page snapshot

```yaml
- generic [ref=e5]:
  - generic [ref=e6]:
    - img [ref=e7]
    - heading "Welcome Back" [level=1] [ref=e9]
    - paragraph [ref=e10]: Sign in to your Dagboek account
  - generic [ref=e11]: "Failed to execute 'json' on 'Response': Unexpected end of JSON input"
  - generic [ref=e12]:
    - generic [ref=e13]:
      - generic [ref=e14]: Email
      - textbox "Enter your email" [ref=e15]: admin@dagboek.com
    - generic [ref=e16]:
      - generic [ref=e17]: Password
      - textbox "Enter your password" [ref=e18]: admin
    - button "Sign In" [active] [ref=e19]
  - paragraph [ref=e20]:
    - text: Don't have an account?
    - link "Sign Up" [ref=e21] [cursor=pointer]:
      - /url: /register
```