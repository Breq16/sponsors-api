import { Octokit } from 'octokit'

const github = new Octokit({
  auth: GITHUB_API_TOKEN,
})

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const incomingOrigin = request.headers.get('Origin')

  if (incomingOrigin && !/(breq\.dev|localhost)/.test(incomingOrigin)) {
    return new Response('Origin Not Allowed', { status: 403 })
  }

  const data = await github.graphql(`
    query {
      user(login: "breq16") {
        sponsors(first: 100) {
          edges {
            node {
              ... on User { login }
              ... on Organization { login }
            }
          }
        }
      }
    }
  `)

  return new Response(
    JSON.stringify({
      sponsors: data.user.sponsors.edges.map(({ node }) => node.login),
    }),
    {
      headers: {
        'content-type': 'application/json',
        'access-control-allow-origin': incomingOrigin,
        vary: 'Origin',
      },
    },
  )
}
