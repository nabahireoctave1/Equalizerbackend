const he= require('he')

const escapeHtmlChar= (value)=>{
    if(typeof value!=='string') return value
    return he.encode(value,{useNamedReferences:true})
}

 const decodeResponse = (data) => {
  if (typeof data === "string") {
    return he.decode(data);
  }

  if (Array.isArray(data)) {
    return data.map(decodeResponse);
  }

  if (data && typeof data === "object") {
    return Object.keys(data).reduce((result, key) => {
      result[key] = decodeResponse(data[key]);
      return result;
    }, {});
  }

  return data;
};


module.exports={
  escapeHtmlChar,
  decodeResponse
};