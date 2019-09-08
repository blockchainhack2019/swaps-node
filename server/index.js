import http from 'http'
import express from 'express'
import middleware from 'server/middleware'
import router from 'server/router'
import socket from 'socket.io'


const port    = 3060
const app     = express()
const server  = http.createServer(app)
const io      = socket(server, { origins: '*:*' })

app.use(middleware)
app.use('/rest', router)

app.use((req, res) => {
  res.json({ message: 'Hello' })
})

server.listen(port, () => {
  console.log(`App listening on port ${port}!`)
})


const getUniqueId = ((id) => () => String(++id))(1)

const users = {}
let orders = []

io.on('connection', (socket) => {
  users[socket.id] = {
    socket,
  }

  io.emit('user connected', { id: socket.id })

  socket.emit('login', {
    id: socket.id,
    users: Object.keys(users),
    orders,
  })

  socket.on('message', ({ to, message }) => {
    console.log('message', to, message)

    if (to) {
      if (users[to]) {
        users[to].socket.emit('private message', { from: socket.id, message })
      }
      else {
        socket.emit('message error', { to, message, error: 'User not found' })
      }
    }
    else {
      io.emit('public message', { from: socket.id, message })
    }
  })

  socket.on('place order', (order) => {
    const extendedOrder = { ...order, id: getUniqueId(), owner: socket.id }

    orders.push(extendedOrder)
    io.emit('new order', extendedOrder)
  })

  socket.on('request swap', ({ id }) => {
    const order = orders.find((order) => order.id === id)

    if (order) {
      if (users[order.owner]) {
        users[order.owner].socket.emit('new swap request', { from: socket.id, order })
      }
      else {
        socket.emit('request swap failed', { id, error: 'User not found' })
      }
    }
    else {
      socket.emit('request swap failed', { id, error: 'Order not found' })
    }
  })

  socket.on('disconnect', () => {
    const ids = orders.filter(({ owner }) => owner === socket.id).map(({ id }) => id)
    orders = orders.filter(({ owner }) => owner !== socket.id)

    delete users[socket.id]

    io.emit('user disconnected', { id: socket.id, orders: ids })
  })
})
