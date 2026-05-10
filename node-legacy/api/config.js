module.exports.book_status = ['ACTIVE', 'INACTIVE']
module.exports.book_status_default = 'ACTIVE'


module.exports.order_total_default = 0;
module.exports.order_payment_default = 'COD';
module.exports.order_status =['PROCESSING', 'COMPLETED']
module.exports.order_status_default = 'PROCESSING'

module.exports.shoppingBag_total_default = 0;
module.exports.shoppingBag_status = ['OPEN', 'CLOSED']
module.exports.shoppingBag_status_default = 'OPEN'


module.exports.user_phone_regex = /^[1-9]{1}[0-9]{9}$/;
module.exports.user_email_regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
module.exports.user_status = ['ACTIVE', 'INACTIVE','BLOCKED']
module.exports.user_status_default = 'ACTIVE'
module.exports.user_userType = ['ADMIN', 'CUSTOMER']
module.exports.user_userType_default = 'CUSTOMER'
module.exports.user_password_regex= /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/


module.exports.book_image_filesize = 1024 * 1024 * 5;
module.exports.book_page_default = 1;
module.exports.book_limitValue_default =2;





