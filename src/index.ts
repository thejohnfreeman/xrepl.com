import 'bootstrap/dist/css/bootstrap.css'
import { codec } from 'ripple-address-codec/dist/xrp-codec'
import * as rbc from 'ripple-binary-codec'

const textBase58 = document.getElementById('base58') as HTMLTextAreaElement
const divBase58Error = document.getElementById(
  'base58-error'
) as HTMLTextAreaElement
const textHex = document.getElementById('hex') as HTMLTextAreaElement
const divHexError = document.getElementById('hex-error') as HTMLTextAreaElement
const textJson = document.getElementById('json') as HTMLTextAreaElement
const divJsonError = document.getElementById('json-error') as HTMLDivElement

function resize(textarea: HTMLTextAreaElement) {
  setTimeout(() => {
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
  }, 0)
}

function resizeAll() {
  resize(textBase58)
  resize(textHex)
  resize(textJson)
}

resizeAll()

function toPrettyHex(bytes) {
  const hex = bytes.toString('hex').toUpperCase()
  let s = ''
  let i = hex.length
  for (; i > 2; i -= 2) {
    s = ' ' + hex.substring(i - 2, i) + s
  }
  return hex.substring(0, i) + s
}

function setJson(bytes) {
  let object: object
  try {
    // TODO: Make ripple-binary-codec accept a byte array.
    object = rbc.decode(bytes.toString('hex'))
  } catch (error) {
    console.error(error)
    divJsonError.textContent = error.toString()
    divJsonError.hidden = false
  }
  divJsonError.hidden = true
  textJson.value = JSON.stringify(object)
}

textBase58.addEventListener('keyup', (event) => {
  const target = event.target as HTMLTextAreaElement
  let bytes: Buffer
  try {
    bytes = codec.decodeRaw(target.value)
  } catch (error) {
    console.error(error)
    divBase58Error.textContent = error.toString()
    divBase58Error.hidden = false
    return
  }
  divBase58Error.hidden = true
  textHex.value = toPrettyHex(bytes)
  setJson(bytes)
  resizeAll()
})

textHex.addEventListener('keyup', (event) => {
  const target = event.target as HTMLTextAreaElement
  const hex = target.value.replace(/\s/g, '').toLowerCase()
  if (hex.length % 2 == 1 || !/^[0-9a-f]*$/.test(hex)) {
    divHexError.textContent = 'Please enter a hexadecimal string.'
    divHexError.hidden = false
    return
  }
  divHexError.hidden = true
  const bytes = Buffer.from(hex, 'hex')
  textBase58.value = codec.encodeRaw(bytes)
  setJson(bytes)
  resizeAll()
})

textJson.addEventListener('keyup', (event) => {
  const target = event.target as HTMLTextAreaElement
  let json: object
  try {
    json = JSON.parse(target.value)
  } catch (error) {
    console.error(error)
    divJsonError.textContent = error.toString()
    divJsonError.hidden = false
    return
  }
  divJsonError.hidden = true

  let bytes: Buffer
  try {
    bytes = Buffer.from(rbc.encode(json), 'hex')
  } catch (error) {
    console.error(error)
    divJsonError.textContent = error.toString()
    divJsonError.hidden = false
    return
  }

  textHex.value = toPrettyHex(bytes)
  textBase58.value = codec.encodeRaw(bytes)
  resizeAll()
})

declare const window: any
window.codec = codec
