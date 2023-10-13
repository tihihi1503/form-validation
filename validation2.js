function Validation(options) {
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  var formRules = {
    // vd fullname: 'required',
    // email: 'required|email'
  };

  /**
   * Quy ước tạo rules
   * 1. khi đúng thì trả ra undefined
   * 2. khi sai trả ra message lỗi
   */
  var rulesObject = {
    required: function (value) {
      return value ? undefined : "Vui Lòng Nhập Trường Này";
    },
    email: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : "Vui Lòng Nhập Đúng Email";
    },
    password: function (value) {
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
    confirmPassword: function (value, getConfirm) {
      var getConfirm = function () {
        return formElement.querySelector('input[name="password"]').value;
      };
      return value === getConfirm()
        ? undefined
        : "Giá Trị Nhập Vào Không Chính Xác";
    },
  };

  var formElement = document.querySelector(options.form);

  if (formElement) {
    var inputs = formElement.querySelectorAll("[name][rules]");
    // vì inputs trả ra một nodeList, nodeList một phần giống array nên chúng ta có thể loop qua
    for (var input of inputs) {
      var rules = input.getAttribute("rules").split("|");
      for (var rule of rules) {
        if (Array.isArray(formRules[input.name])) {
          formRules[input.name].push(rulesObject[rule]);
        } else {
          formRules[input.name] = [rulesObject[rule]];
        }
        // return formRules
      }

      // Lắng nghe event để validate (blur, change,...)
      input.onblur = handleValidate;
      input.oninput = removeValidate;

      // đặt key : value của object formRules đã định nghĩa ở trên == name(input.name) có value(input.getAttribute)
      // formRules[input.name] = input.getAttribute('rules')

      // rulesObject[rule] là để lấy ra các function trùng tên với Attribute rules
    }
    // Xử lý hành vi submit form
    formElement.onsubmit = function (e) {
      e.preventDefault();
      var formValid = true;
      var inputs = formElement.querySelectorAll("[name][rules]");
      for (var input of inputs) {
        // handleValidate() nhận một tham số {} >> ta coi {} là đối tượng event (e)
        // và truyền vào {} là target: input, vì event (e) có phương thức target nên ta gán target là input
        // tương tự như e.target === e.input
        // để thực hiện validate tất cả thẻ input đã loop qua
        var isError = handleValidate({
          target: input,
        });
        if (!isError) {
          formValid = false;
        }
      }
      if (formValid) {
        var inputs = formElement.querySelectorAll("[name][rules]");
        var data = Array.from(inputs).reduce(function (values, input) {
          switch (input.type) {
            case "checkbox":
              if (!input.matches(":checked")) return values;

              if (Array.isArray(values[input.name])) {
                values[input.name].push(input.value);
              } else {
                values[input.name] = [input.value];
              }

              break;
            case "radio":
              var inputChecked = formElement.querySelector(
                "input[name=" + input.name + "]:checked"
              );
              values[input.name] = inputChecked.value;
              break;
            default:
              values[input.name] = input.value;
          }
          return values;
        }, {});
        console.log(data);
      }
    };
    // Hàm thực hiện validate
    function handleValidate(e) {
      // value: e.target.value
      // hàm chạy rule: formRules[e.target.name] //Lưu ý fill input có 2 rule trở lên sẽ bị lỗi, nên ta cần loop qua
      // ta truyền value vào hàm chạy
      var error;
      var rules = formRules[e.target.name];
      for (var rule of rules) {
        switch (e.target.type) {
          case "checkbox":
          case "radio":
            error = rule(
              formElement.querySelector(
                "input[name=" + e.target.name + "]:checked"
              )
            );
            break;
          default:
            error = rule(e.target.value);
        }
        if (error) break;
      }

      var parent = getParent(e.target, options.formGroup);
      if (parent) {
        var formMessage = parent.querySelector(options.formMessage);
      }

      if (error) {
        parent.classList.add("invalid");
        formMessage.innerText = error;
      }
      return !error;
    }

    function removeValidate(e) {
      var parent = getParent(e.target, options.formGroup);
      if (parent.classList.contains("invalid")) {
        parent.classList.remove("invalid");
      }
      if (parent) {
        var formMessage = parent.querySelector(options.formMessage);
        formMessage.innerText = "";
      }
    }

    console.log(formRules);
  }
}
