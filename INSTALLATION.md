# Warper Installation Guide

Warper is distributed as a private package through GitHub Packages. Only authorized sponsors have access.

## Prerequisites

You must be a [GitHub Sponsor](https://github.com/sponsors/itsmeadarsh2008) to install this package.

## Step 1: Create a Personal Access Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name like "Warper Package Access"
4. Select the `read:packages` scope
5. Click "Generate token"
6. **Copy the token** — you won't see it again!

## Step 2: Configure npm/bun to use GitHub Packages

Create or edit `~/.npmrc` in your home directory:

```bash
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
@warper-org:registry=https://npm.pkg.github.com
```

Replace `YOUR_GITHUB_TOKEN` with your personal access token.

**Alternative: Environment variable (recommended for CI/CD)**

```bash
export WARPER_AUTH_TOKEN=YOUR_GITHUB_TOKEN
```

## Step 3: Install Warper

```bash
# Using npm
npm install @warper-org/warper

# Using bun
bun add @warper-org/warper

# Using yarn
yarn add @warper-org/warper

# Using pnpm
pnpm add @warper-org/warper
```

## Step 4: Usage

```tsx
import { WarperComponent } from '@warper-org/warper';

function App() {
  return (
    <WarperComponent
      itemCount={1_000_000}
      estimateSize={() => 44}
      overscan={5}
    >
      {(index) => <Row data={items[index]} />}
    </WarperComponent>
  );
}
```

## Troubleshooting

### Error: 401 Unauthorized

- Ensure your GitHub token has the `read:packages` scope
- Verify you're an active sponsor at [github.com/sponsors/itsmeadarsh2008](https://github.com/sponsors/itsmeadarsh2008)
- Check that your `.npmrc` file is correctly configured

### Error: 404 Not Found

- Make sure the package scope is correct: `@warper-org/warper`
- Verify the registry URL in your `.npmrc`

## Support

For questions or issues, contact: [e2vylu0d0@mozmail.com](mailto:e2vylu0d0@mozmail.com)
