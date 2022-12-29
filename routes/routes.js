const express = require("express");
const {postLinks, getSingleLink, getAllLinks, deleteLinks} = require("../controller/linktreeControl")
const requireAuth = require('../middleware/requireAuth')

const router = express.Router();

// require auth for all




router.get('/links', requireAuth, getAllLinks)
router.get('/:id', getSingleLink)

router.post('/links', requireAuth, postLinks )

router.delete('/:id', requireAuth, deleteLinks );
module.exports = router  