import { Octokit } from 'octokit'

const github = new Octokit({
  auth: GITHUB_TOKEN,
})

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
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
      headers: { 'content-type': 'application/json' },
    },
  )
}
