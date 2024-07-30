import { Hono } from 'hono'

const app = new Hono()

console.log("* Starting")

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
