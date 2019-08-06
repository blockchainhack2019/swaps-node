export default ({ router }) => {

  router.get('/features', async (req, res) => {
    res.json({ success: true })
  })

}
