var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
function Validation(options) {
  var formElement = document.querySelector(options.form);
  // Hàm lấy ra thẻ cha có selector mong muốn
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }
  // Hàm validate
  function validate(inputElement, rule) {
    // value: inputElement.value
    // chay ham test()
    var error = rule.test(inputElement.value);
    var parent = getParent(inputElement, options.formGroup);
    var message = parent.querySelector(options.formMessage);

    // Đặt rules là object saveRules : kết quả thu được từ vòng lặp forEach
    var rules = saveRules[rule.selector];
    for (var i = 0; i < rules.length; ++i) {
      switch (inputElement.type) {
        case "checkbox":
        case "radio":
          // rules[i] tương tự như hàm rule.test()

          // Trong trường hợp (case) 'checkbox', 'radio'
          // chúng ta lấy giá trị value của input đã check và truyền vào hàm rule.test để thực hiện hành động validate
          error = rules[i](
            formElement.querySelector(rule.selector + ":checked")
          );
          break;
        default:
          // rules[i] tương tự như hàm rule.test()
          error = rules[i](inputElement.value);
      }
      if (error) break;
    }

    if (error) {
      parent.classList.add("invalid");
      message.innerText = error;
    } else {
      parent.classList.remove("invalid");
      message.innerText = "";
    }
    // trả về error có giá trị boolean để đem xử lý ở onsubmit
    return !error;
  }

  // Hàm removeValidate
  function removeValidate(inputElement, rule) {
    var parent = getParent(inputElement, options.formGroup);
    var message = parent.querySelector(options.formMessage);

    parent.classList.remove("invalid");
    message.innerText = "";
  }

  if (formElement) {
    formElement.onsubmit = function (e) {
      // Đặt formValid = true khi chúng ta không nhận bất kì lỗi nào
      var formValid = true;
      e.preventDefault();
      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);
        // Hàm validate() trả về error có boolean true/false
        // ... khi có lỗi (isError = false) // ... khi hợp lệ (isError = true)
        var isError = validate(inputElement, rule);

        // Khi có lỗi thì ta đặt formValid thành giá trị false
        if (!isError) {
          formValid = false;
        }
      });

      if (formValid) {
        // Trong trường hợp true thì ta xử lý

        if (typeof options.onSubmit === "function") {
          // enableInput trả ra nodeList
          var enableInput = formElement.querySelectorAll("[name]");

          // biến enableInput từ nodeList thành array và gán cho formValue
          // để xử lý reduce (vì reduce không dùng được với nodeList)
          var formValue = Array.from(enableInput).reduce(function (
            values,
            input
          ) {
            switch (input.type) {
              case "checkbox":
                if (!input.matches(":checked")) return values;

                if (!Array.isArray(values[input.name])) {
                  values[input.name] = [];
                }
                values[input.name].push(input.value);
                break;

              case "radio":
                var inputChecked = formElement.querySelector(
                  'input[name="' + input.name + '"]:checked'
                );
                values[input.name] = inputChecked.value;
                break;

              default:
                values[input.name] = input.value;
            }
            return values;
          },
          {});
          // truyền tham số formValue = data của thiết kế (contructor) html
          options.onSubmit(formValue);
        } else {
          // Trong trường hợp không có onSubmit là một function thì chúng ta thực hiện phương thức submit()
          // mặc định của trình duyệt
          formElement.submit();
        }
      }
    };
    var saveRules = {};
    options.rules.forEach(function (rule) {
      var inputElement = formElement.querySelector(rule.selector);

      // Chúng ta dùng vòng lặp để lấy ra các rule được thiết kế sẵn
      // nếu 1 fill input có đến 2 rule trở lên thì bắt đầu gán nó vào 1 mảng

      if (Array.isArray(saveRules[rule.selector])) {
        // 2. Sau khi biến saveRules[rule.selector] thành 1 array, nếu fill input có 2 rule trở lên thì
        // chúng ta đẩy thêm value rule.test tiếp theo vào mảng array
        saveRules[rule.selector].push(rule.test);
      } else {
        // 1. Khi saveRules[rule.selector] không phải là 1 array
        // thì chúng ta gán nó thành một array và có value là rule.test
        saveRules[rule.selector] = [rule.test];
      }

      if (inputElement) {
        inputElement.onblur = function () {
          validate(inputElement, rule);
        };
        inputElement.oninput = function () {
          removeValidate(inputElement, rule);
        };
      }
    });
    // chúng ta thu về object saveRules sau khi kết thúc vòng lặp
    console.log(saveRules);
  }
}

Validation.isRequired = function (selector) {
  return {
    selector: selector,
    test: function (value) {
      return value ? undefined : "Vui Lòng Nhập Trường Này";
    },
  };
};

Validation.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return regex.test(value)
        ? undefined
        : message || "Vui Lòng Nhập Trường Này";
    },
  };
};

Validation.isPassword = function (selector) {
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
    },
  };
};

Validation.isConfirmPassword = function (selector, message, getConfirm) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirm()
        ? undefined
        : message || "Vui Lòng Nhập Trường Này";
    },
  };
};
