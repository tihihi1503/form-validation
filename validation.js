var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/


function Validator(options) {

    // Hàm getParent nhận vào 2 tham số là element và selector
    // để kiểm tra xem khi có thẻ cha mà không matches với selector
    // thì element sẽ được gán với thẻ cha không matches
    // và tiếp tục vòng lặp cho đến khi tìm được thẻ cha có selector, trả về thẻ cha đó >> kết thúc vòng lặp

    // Để make sure tìm đúng thẻ cha có selector , nếu không kiểm tra sẽ bị bug
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    var formElement = document.querySelector(options.form)
    
    // định nghĩa isFormValid để xử lí submit
    var isFormValid = true 
    formElement.onsubmit = function (e) {
        // Để ngăn chặn hành động mặc định của button có type submit
        e.preventDefault() 
        // các rule được lặp qua và kiểm tra xem nếu các trường không được nhập
        // thì sẽ validate tất của thẻ inputElement bằng cách rule đã định nghĩa ở dưới trước đó
        options.rules.forEach(function (rule) {
            var inputElement = formElement.querySelector(rule.selector)

            // giá trị boolean ở trên của error sẽ được validate() trả về
            // 1. nếu tất cả có lỗi thì sẽ validate toàn bộ inputElement >> gán
            // isFormValid = false và không xử lí ở hàm điều kiện ở dưới
            
            var isValid = validate(inputElement, rule)

            if (!isValid) {
                isFormValid = false
            }
        })
        
        //2. nếu tất cả các rule đều hợp lệ >> thì isFormValid = true và được xử lý logic
        if (isFormValid == true) {
            // Trường hợp submit với js
            // Kiểm tra xem onSubmit có phải là function hay không
            if (typeof options.onSubmit === 'function') {
                // querySelectorAll trả ra một nodeList
                // Vì nodeList không xử dụng được phương thức reduce
                var enableInput = formElement.querySelectorAll('[name]')

                // Nên chúng ta sẽ truyền giá trị của enableInput vào mảng enableInputArray
                // và dùng reduce để xử lý 
                var enableInputArray = Array.from(enableInput)
        
                var formValues = enableInputArray.reduce(function (values, input) {
                    switch (input.type) {
                        case 'checkbox':
                            if (!input.matches(':checked')) return values

                            if (!Array.isArray(values[input.name])) {
                                values[input.name] = []
                            }
                            values[input.name].push(input.value)
                            break;
                        case 'radio':
                            var inputChecked = formElement.querySelector('input[name="' + input.name + '"]:checked');
                            values[input.name] = inputChecked.value    
                            break;
                        default: 
                        // trả về cặp key : value (Values[input.name] là key
                        // input.value là value) 
                        // và cuối cùng trả về một object có chứa các key : value
                        // bằng phương thức reduce có initialValue là {}
                            values[input.name] = input.value    
                    }
                    return  values
                }, {})
                
                options.onSubmit(formValues)
            } else {
                options.onSubmit(null)
            }
            // Trường hợp với hành vi mặc định của trình duyệt
        //     else {
        //         formElement.submit()
        //    }
        } 
    }
    
    // Hàm validate
    function validate(inputElement, rule) {
        
        var parent = getParent(inputElement, options.formGroup)
        var message = parent.querySelector(options.formMessage)
        // value: inputElement.value
        // chạy hàm test
        // var error = rule.test(inputElement.value) 

        var error;
        
        // console.log(saveRules[rule.selector])
        
        var rules = saveRules[rule.selector]
        for (var i = 0; i < rules.length; ++i) {
            
            switch (inputElement.type) {
                case 'checkbox':
                case 'radio':
                    error = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    )
                    break;
                default:
                    // vì rule[i] tương tự như rule.test() >> đều là chạy hàm test
                    // nên chúng ta có thể gán lại error = rules[i](inputElement.value) thay cho biến var
                    // error ở trên
                    error = rules[i](inputElement.value)

            }
            // vòng lặp sẽ chạy từng rule >> nếu xảy ra lỗi error thì vòng lặp sẽ kết
            //thúc và trả về rule tương ứng 
            if (error) break
        }
        
        if (error) {
            parent.classList.add('invalid')
            message.innerText = error
        } else {
            parent.classList.remove('invalid')
            message.innerText = ''
        }
        // trả ra error có giá trị boolean và mang nó đi xử lí ở submit
        return !error
    }

    // Hàm xóa bỏ hiệu ứng khi nhập input
    function xoaBoHieuUng(inputElement, rule) {
        var parent = getParent(inputElement, options.formGroup)
        var message = parent.querySelector(options.formMessage)
        
        parent.classList.remove('invalid')
        message.innerText = ''
    }


    

    
    // khai báo đối tượng saveRules 
    var saveRules = {}

    // 
    if (formElement) {
        options.rules.forEach(function (rule) {

            // Câu điều kiện để kiểm tra rule trong vòng
            // lặp forEach và lưu các rule vào đối tượng saveRules

            // 1. nếu saveRules[rule.selector] (Đây là key của saveRule có tên selector) là một array
            // thì đẩy giá trị rule.test vào mảng array
            // 2. nếu không phải thì trả về cặp key : value là một mảng
            
            if (Array.isArray(saveRules[rule.selector])) {
                saveRules[rule.selector].push(rule.test)
            } else {
                saveRules[rule.selector] = [rule.test]
            }
            
            // 
            var inputElements = formElement.querySelectorAll(rule.selector)
            Array.from(inputElements).forEach(function (inputElement) {
                if (inputElement) {
                    inputElement.onblur = function () {
                        validate(inputElement, rule)
                    }
    
                    inputElement.oninput = function () {
                        xoaBoHieuUng(inputElement, rule)
                    }
                }
            })
        })
        // kết thúc vòng lặp ta thu về được đối tượng saveRules
        // chứa các cặp key(saveRules[rule.selector]) : value(rule.test)
        // console.log(saveRules)
    }
}


Validator.isRequired = function (selector) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : 'Vui lòng nhập trường này!'
        }
    }
}

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return regex.test(value) ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}
Validator.isPassword = function (selector) {
    return {
        selector: selector,
        test: function (value) {
            // Kiểm tra độ dài của mật khẩu
            if (value.length < 8) {
                return "Mật khẩu quá ngắn, phải có ít nhất 8 ký tự.";
            }

            // Kiểm tra xem mật khẩu có chứa ít nhất một ký tự viết hoa
            if (!/[A-Z]/.test(value)) {
                return "Mật khẩu phải chứa ít nhất một ký tự viết hoa.";
            }

            // Kiểm tra xem mật khẩu có chứa ít nhất một ký tự viết thường
            if (!/[a-z]/.test(value)) {
                return "Mật khẩu phải chứa ít nhất một ký tự viết thường.";
            }

            // Kiểm tra xem mật khẩu có chứa ít nhất một số
            if (!/\d/.test(value)) {
                return "Mật khẩu phải chứa ít nhất một số.";
            }

            // Mật khẩu hợp lệ
            return undefined;

        }
    }
}
Validator.isPasswordConfirm = function (selector, getConfirm, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirm() ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}