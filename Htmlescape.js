const he= require('he')

const escapeHtmlChar= (value)=>{
    if(typeof value!=='string') return value
    return he.encode(value)
}


module.exports={escapeHtmlChar};