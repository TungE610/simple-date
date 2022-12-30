import * as C from './constants'
import U from './utils.js'


const isDayjs = d => d instanceof SimpleDate // eslint-disable-line no-use-before-define

const simpleDate = function (date, c) {
  if (SimpleDate(date)) {
    return date.clone()
  }
  // eslint-disable-next-line no-nested-ternary
  const cfg = typeof c === 'object' ? c : {}
  cfg.date = date
  cfg.args = arguments// eslint-disable-line prefer-rest-params
  return new SimpleDate(cfg) // eslint-disable-line no-use-before-define
}

const wrapper = (date, instance) =>
    simpleDate(date, {
    	x: instance.$x,
    	$offset: instance.$offset // todo: refactor; do not use this.$offset in you code
 	}
)

const Utils = U // for plugin use
Utils.w = wrapper

const parseDate = (cfg) => {
  const {date} = cfg
  if (date === null) return new Date(NaN); // null is invalid

  // TODO:Check
  // if (Utils.u(date)) return new Date();// today 

  return new Date(date) // everything else
}

class SimpleDate {
  constructor(cfg) {
    this.parse(cfg);
  }

  parse(cfg) {
    this.$d = parseDate(cfg)
    this.$x = cfg.x || {}   // define x: 
    this.init()
  }

  init() {
    const { $d } = this
    this.$y = $d.getFullYear();  // $y: Full year
    this.$M = $d.getMonth();	 // $M: Get month
    this.$D = $d.getDate();		 // $D: Date 
    this.$W = $d.getDay();		 // $W: Day
    this.$H = $d.getHours();	 // $H: Hour
    this.$m = $d.getMinutes();	 // $m: Minutes
    this.$s = $d.getSeconds();	 // $ms: Milliseconds
    this.$ms = $d.getMilliseconds();
  }

  $utils() {
    return Utils
  };
  
  valueOf() {
    // timezone(hour) * 60 * 60 * 1000 => ms
    return this.$d.getTime(); // return time value of instance
  };

  format(formatStr) {

    const str = formatStr || C.FORMAT_DEFAULT;
    const { $H, $m, $M } = this;

    const getShort = (arr, index, full, length) => (
      (arr && (arr[index] || arr(this, str))) || full[index].slice(0, length)
    );
    
    const get$H = num => Utils.ps($H % 12 || 12, num, '0'); // 8 => 08; 12 || 24 => 12

    const matches = {
      YY: String(this.$y).slice(-2),
      YYYY: this.$y,
      M: $M + 1,
      MM: Utils.ps($M + 1, 2, '0'),
      MMMM: getShort(months, $M),
      D: this.$D,
      DD: Utils.ps(this.$D, 2, '0'),
      d: String(this.$W),
      dddd: weekdays[this.$W],
      H: String($H),
      HH: Utils.ps($H, 2, '0'),
      h: get$H(1),
      hh: get$H(2),
      m: String($m),
      mm: Utils.ps($m, 2, '0'),
      s: String(this.$s),
      ss: Utils.ps(this.$s, 2, '0'),
      SSS: Utils.ps(this.$ms, 3, '0'),
    }

    return str.replace(C.REGEX_FORMAT, (match, $1) => $1 || matches[match] )
  }

  diff(input, units, float) {
    const unit = Utils.p(units)
    const that = dayjs(input)
    const diff = this - that
    let result = Utils.m(this, that)

    result = {
      [C.Y]: result / 12,
      [C.M]: result,
      [C.Q]: result / 3,
      [C.W]: (diff - zoneDelta) / C.MILLISECONDS_A_WEEK,
      [C.D]: (diff - zoneDelta) / C.MILLISECONDS_A_DAY,
      [C.H]: diff / C.MILLISECONDS_A_HOUR,
      [C.MIN]: diff / C.MILLISECONDS_A_MINUTE,
      [C.S]: diff / C.MILLISECONDS_A_SECOND
    }[unit] || diff // milliseconds

    return float ? result : Utils.a(result)
  }

  daysInMonth() {
    return this.endOf(C.M).$D
  }

  clone() {
    return Utils.w(this.$d, this)
  }

  toDate() {
    return new Date(this.valueOf());
  }

  toJSON() {
    return this.isValid() ? this.toISOString() : null;
  }

  toISOString() {
    return this.$d.toISOString();
  }

  toString() {
    return this.$d.toUTCString();
  }
}

const proto = SimpleDate.prototype
dayjs.prototype = proto;
[
  ['$ms', C.MS],
  ['$s', C.S],
  ['$m', C.MIN],
  ['$H', C.H],
  ['$W', C.D],
  ['$M', C.M],
  ['$y', C.Y],
  ['$D', C.DATE]
].forEach((g) => {
  proto[g[1]] = function (input) {
    return this.$g(input, g[0], g[1])
  }
})

dayjs.extend = (plugin, option) => {
  if (!plugin.$i) { // install plugin only once
    plugin(option, SimpleDate, dayjs)
    plugin.$i = true
  }
  return dayjs
}

dayjs.isDayjs = isDayjs

dayjs.unix = timestamp => (
  dayjs(timestamp * 1e3)
)

dayjs.en = Ls[L]
dayjs.Ls = Ls
dayjs.p = {}
export default dayjs