import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import { restart } from 'nodemon'

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/blogPostsNew2"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

// Setup models

const Blogpost = mongoose.model('Blogpost', {

    headline: {
        type: String,
        required: true,
        minlenght: 5,
        maxlenght: 140
    },
    text: {
        type: String,
        required: true,
        minlenght: 5,
        maxlenght: 140
    },
    imgName: {
        type: String,
        minlenght: 5,
        maxlenght: 140
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
})

const Comment = mongoose.model('Comment', {

    message: String,

})


/* const seedDB = async() => {
    await Blogpost.deleteMany()
    await Comment.deleteMany()

    const hd1 = new Blogpost({ headline: 'test', message: '1' })
    await hd1.save()

    const hd2 = new Blogpost({ headline: 'test2', message: '2' })
    await hd2.save()

    const c1 = new Comment({ message: 'gret job dude!' })
    await c1.save()
}

seedDB() */

// Defines the port the app will run on. Defaults to 8080, but can be 
// overridden when starting the server. For example:
//
//   PORT=9000 npm start
const port = process.env.PORT || 8080
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(bodyParser.json())

// Start defining your routes here
// för att lista alla blogposts på tex första sidan


app.get('/', (req, res) => {
    res.send('hello')
});

// för att visa alla blogposts
app.get('/blogposts', async(req, res) => {
    const posts = await Blogpost.find()
    res.json(posts)
})

// för att visa alla kommentarer som test
app.get('/comments', async(req, res) => {
    const comments = await Comment.find()
    res.json(comments)
})

// för att skapa en blogpost
app.post('/blogposts', async(req, res) => {
    const blogpost = new Blogpost(req.body)
    try {
        const saved = await blogpost.save()
        res.status(201).json(saved)
    } catch (err) {
        res
            .status(400)
            .json({ message: 'could not save blogpost', errors: err.errors })
    }
})

// för att visa en specifik blogpost
app.get('/blogposts/:id', async(req, res) => {
    const { id } = req.params
    try {
        const blogpost = await BlogPost.findById(id)
        res.status(200).json(blogpost)
    } catch (err) {
        res.status(404).json({ message: 'blogpost not found' })
    }
})

// för att skapa en kommentar på en specifik blogpost
app.post('/blogposts/:id/comment', async(req, res) => {
    const { id } = req.params
    const blogpost = await Blogpost.findById(id) // get the whole blogpost info from the blog id
    try {
        const comment = new Comment(req.body)
        const savedComment = await comment.save()
        const blogpost = await Blogpost.findOneAndUpdate({ blogId: id }, {
            $push: {
                comments: { savedComment }
            }
        }, { new: true })
        res.status(200).json(savedComment)
    } catch (err) {
        res.status(400).json({ message: 'could not create comment' })
    }
})

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})