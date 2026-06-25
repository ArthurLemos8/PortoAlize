import {z} from 'zod'

z.config({
  customError: (iss) => {
    if (iss.code === 'invalid_type') {
      return 'Campo obrigatório.'
    }
    if (iss.code === 'too_small') {
      return 'Campo obrigatório.'
    }
    if (iss.code === 'custom') {
      return 'Campo obrigatório.'
    }
    if (iss.code === 'too_big') {
      const max = iss.maximum

      if (iss.origin === 'string') {
        return `Campo deve conter no máximo ${max} caracteres.`
      }

      if (iss.origin === 'number') {
        return `O valor deve ser menor ou igual a ${max}.`
      }

      return `O limite máximo de ${max} foi excedido.`
    }
  },
})
