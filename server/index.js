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


const users = {}
const orders = []

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
        socket.emit('message error', { to, data, error: 'User not found' })
      }
    }
    else {
      io.emit('public message', { from: socket.id, message })
    }
  })

  socket.on('place order', (order) => {
    io.emit('new order', { ...order, owner: socket.id })
  })

  socket.on('disconnect', () => {
    delete users[socket.id]
    io.emit('user disconnected', { id: socket.id })
  })
})
