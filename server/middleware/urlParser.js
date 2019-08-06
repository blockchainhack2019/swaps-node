import url from 'url'


const urlParser = (req, res, next) => {
  const { origin, hostname, originalUrl, referer } = req
  const { path, href, pathname, ...rest } = url.parse(`${origin}${originalUrl}`, true)

  req.parsedUrl = {
    ...rest,
    path: decodeURI(path),
    href: decodeURI(href),
    pathname: decodeURI(pathname),
    referer: referer ? referer.split(hostname)[1] : null,
  }

  next()
}


export default urlParser
