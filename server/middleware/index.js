import { compose } from 'compose-middleware'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'

import cors from './cors'
import error from './error'
import urlParser from './urlParser'


export default compose([
  cors,
  error,
  bodyParser.json(),
  bodyParser.urlencoded({ extended: false }),
  cookieParser(),
  urlParser,
])
