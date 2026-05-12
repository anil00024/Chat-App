process.env.NODE_ENV = 'test'
process.env.DB_PATH = ':memory:'
process.env.JWT_SECRET = 'test_secret'

const request = require('supertest')
const { app, server } = require('../server')

afterAll((done) => {
  server.close(done)
})

describe('POST /api/auth/register', () => {
  it('registers a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', email: 'alice@test.com', password: 'password123' })
    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('token')
    expect(res.body.user.username).toBe('alice')
    expect(res.body.user).not.toHaveProperty('password')
  })

  it('rejects duplicate username', async () => {
    await request(app).post('/api/auth/register')
      .send({ username: 'bob', email: 'bob@test.com', password: 'password123' })
    const res = await request(app).post('/api/auth/register')
      .send({ username: 'bob', email: 'bob2@test.com', password: 'password123' })
    expect(res.statusCode).toBe(409)
  })

  it('rejects short password', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ username: 'charlie', email: 'charlie@test.com', password: '123' })
    expect(res.statusCode).toBe(400)
  })

  it('rejects invalid email', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ username: 'dave', email: 'not-an-email', password: 'password123' })
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    await request(app).post('/api/auth/register')
      .send({ username: 'loginuser', email: 'login@test.com', password: 'secret123' })
  })

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ username: 'loginuser', password: 'secret123' })
    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('token')
  })

  it('rejects wrong password', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ username: 'loginuser', password: 'wrong' })
    expect(res.statusCode).toBe(401)
  })

  it('rejects unknown user', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ username: 'nobody', password: 'secret' })
    expect(res.statusCode).toBe(401)
  })
})

describe('GET /api/auth/me', () => {
  let token

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ username: 'meuser', email: 'me@test.com', password: 'secret123' })
    token = res.body.token
  })

  it('returns current user with valid token', async () => {
    const res = await request(app).get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toBe(200)
    expect(res.body.user.username).toBe('meuser')
  })

  it('rejects without token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.statusCode).toBe(401)
  })

  it('rejects with bad token', async () => {
    const res = await request(app).get('/api/auth/me')
      .set('Authorization', 'Bearer badtoken')
    expect(res.statusCode).toBe(401)
  })
})