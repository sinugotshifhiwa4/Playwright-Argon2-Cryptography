# Important Notice

When pushing code to GitHub or Azure DevOps repositories, **always make sure to add the `envs` directory to `.gitignore`**. This is crucial to avoid leaking sensitive data in your repositories.

It is a best practice and highly recommended to store sensitive items like keys in **vaults** or **environment variables** (such as those in GitHub, Azure DevOps, or any other platform you are using).

For the purpose of this project, I will include the `envs` directory but **will not push the `.env` file**, as it contains the secret key. You will need to run `GenerateSecretKey.spec` to generate the secret key for your specific environment.

I will keep `.env.ENV` files (e.g., `.env.uat`, `.env.dev`) so that you can view the structure of the encrypted data.
