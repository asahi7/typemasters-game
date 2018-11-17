/*
Fake implementation of socket.io client to check correct execution on the server side.
 */
const io = require('socket.io-client')
const socket = io.connect('http://localhost:3000', { reconnect: true })

socket.on('connect', function () {
  socket.emit('authentication', { token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjM1OWJjZGNmZTY2MmQzZjFjMDlkZTFjYmEzMGQ5OWY3ZjRmOThkNjkiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vdHlwZW1hc3RlcnMtY2MwMjgiLCJhdWQiOiJ0eXBlbWFzdGVycy1jYzAyOCIsImF1dGhfdGltZSI6MTU0MjI3ODU4NywidXNlcl9pZCI6Im02dDQwY2ZEQ2JmeDNXMWtkNkdoMVFuR3hQRjIiLCJzdWIiOiJtNnQ0MGNmRENiZngzVzFrZDZHaDFRbkd4UEYyIiwiaWF0IjoxNTQyMjc4NTg5LCJleHAiOjE1NDIyODIxODksImVtYWlsIjoic21hZ3Vsb3ZheWJla0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsic21hZ3Vsb3ZheWJla0BnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.OnhBQYyYwKxnGnhfi4idEsaZibWZnbMrHmzPlmsrhR6g7y6Z3KmTGsazsF7gIoeo_clGi1Un4h3wlvUtDs61NSE9b_0HWz2JI647fbbOauyejnhB8dat_L2rAr_zJROSDFWYijntwM9j1pewuMYFVMzRMcXE1FJCfqATy1Sw8GPleNeJqCVWpyEm3HRkK-UICsmN4pyLWZdBgN_NVtji8O6zdMlab1TWTqFnyKeFHvO4-qBoucQM986Qrb0lLqysY-MSlcSMh5ogEHhe2Qj8k6aMrRE-pa1CHbsNSsP7Eq7Jmx8j3TJdKQMQTy1rVvFeJu6kMZO2UexzYZ4hXPZcvg' }) // TODO(aibek): retrieve somehow dynamically
  socket.on('authenticated', function () {
    console.log('Asking for a new game..')
    socket.emit('newgame')

    socket.on('gamestarted', function (data) {
      console.log(data.msg)
      console.log(data)
    })

    socket.on('gamedata', function (data) {
      console.log(data)
    })

    socket.on('gameended', function (msg) {
      console.log('game ended')
      console.log(msg)
    })
  })
})
