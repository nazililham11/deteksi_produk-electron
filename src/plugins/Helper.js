// src: https://stackoverflow.com/a/14428340
const NumFormat = (val, n, x) => {
    if (isNaN(val))
        return '-'
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')'
    return val.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,')
}

const PriceFormat = (value, decimal, section) => {
    decimal = decimal || 0
    section = section || 3
    return "Rp." + NumFormat(value, decimal, section)
}
const AccuracyFormat = (value) => {
    return parseFloat(value*100).toFixed(1) + "%"
}

const ScaleBetweenResolution = (from_width, to_width) => {
    const scale = to_width / from_width
    // console.log({from_width, to_width, scale})
    return scale
}

const CreateBBoxUrlData = (virtual_canvas, item, image) => {
    const canvas  = document.getElementById(virtual_canvas)
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight

    // Mencari skala antara gambar resolusi pada layar dengan resolusi original 
    const scale = ScaleBetweenResolution(image.offsetWidth, image.naturalWidth)

    // Besrsihkan canvas
    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    
    // Config + scaling
    const font_size = parseInt(14  * scale)
    const margin = parseInt(2 * scale)
    const lineWidth = parseInt(4 * scale)
    
    // Font
    ctx.font = font_size+"px sans-serif"
    ctx.textBaseline = "top"

    // Bounding box
    const x = item.bbox[0]
    const y = item.bbox[1]
    const width = item.bbox[2]
    const height = item.bbox[3]
    const score = AccuracyFormat(item.score)
    const label = `${item.class.name} ${score}`

    // Gambar bounding box pada canvas
    ctx.strokeStyle = item.class.color
    ctx.lineWidth = lineWidth
    ctx.strokeRect(x, y, width, height)

    // Gambar background untuk label
    ctx.fillStyle = item.class.color
    const textWidth = ctx.measureText(label).width
    const textHeight = font_size
    ctx.fillRect(x, y, textWidth + (margin*2), textHeight + (margin*2))

    // Gambar text
    ctx.fillStyle = item.class.font_color
    ctx.fillText(label, x + margin, y + margin)

    // Convert to image data url
    return canvas.toDataURL('image/png')
}

export { 
    NumFormat, PriceFormat, AccuracyFormat, 
    CreateBBoxUrlData
}