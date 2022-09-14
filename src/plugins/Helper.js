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

const CreateBBoxUrlData = (virtual_canvas, item, imageSize) => {
    const canvas  = document.getElementById(virtual_canvas)
    canvas.width = imageSize.width
    canvas.height = imageSize.height
    console.log(imageSize)

    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    
    // Font options.
    const font = "16px sans-serif"
    ctx.font = font
    ctx.textBaseline = "top"

    // Bounding box
    const x = item.bbox[0]
    const y = item.bbox[1]
    const width = item.bbox[2]
    const height = item.bbox[3]
    const score = AccuracyFormat(item.score)
    const label = `${item.class.name} ${score}`
    const padding = 6
    const margin = 3

    // Draw the bounding box.
    ctx.strokeStyle = item.class.color
    ctx.lineWidth = 5
    ctx.strokeRect(x, y + 1, width, height)

    // Draw the label background.
    ctx.fillStyle = item.class.color
    const textWidth = ctx.measureText(label).width
    const textHeight = parseInt(font, 7)
    ctx.fillRect(x, y, textWidth + padding, textHeight + padding)

    // Draw the text last to ensure it's on top.
    // ctx.fillStyle = "#ffffff"
    ctx.fillStyle = item.class.font_color
    ctx.fillText(label, x + margin, y + margin)

    return canvas.toDataURL('image/png')
}

export { 
    NumFormat, PriceFormat, AccuracyFormat, 
    CreateBBoxUrlData
}