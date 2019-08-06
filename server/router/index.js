import { Router } from 'express'

import features from './features'


const router = Router()

features({ router })


export default router
