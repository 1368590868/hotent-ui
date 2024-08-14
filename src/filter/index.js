import Vue from 'vue'
import computerSize from './computerSize'
import dateFormat from './dateFormat'

const filters = {
  computerSize,
  dateFormat,
}

Object.keys(filters).forEach((name) => Vue.filter(name, filters[name]))
