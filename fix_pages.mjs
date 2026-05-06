import fs from "fs";

function replaceTerms() {
  const file = "src/pages/Terms.tsx";
  let content = fs.readFileSync(file, "utf8");
  
  // replace bg
  content = content.replace(
    'className="flex-1 bg-surface min-h-screen text-on-surface pb-24"',
    'className="flex-1 bg-transparent min-h-screen text-on-surface pb-24"'
  );
  
  // replace image src
  content = content.replace(
    'src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNm2HLjqWbCmeIQ8CL4M7kRUrRaLJ3rJned_WLrEtgJWunyIhBaQYl2KQGy26WkLNaUyXUNifaFltAmoRY4PPxIOUnEithCUKe611JWkfeU-ums-vc0mf2Z6hyPFW_nW8CnGt_nTBzXY3jIefolNjxMNsTGoNq1MsTrbsh6AyPizoejtDbL0byUjeQbfkMT4woWyD5XWh7W89K19IZ-2G_XLTi0SbuP2pbT45MUlGC3UfYm9Vo9qXeNnN95IOabEVVAjhv9NvuFLEm"',
    'src="/images/fondo_legal.jpg"'
  );
  
  fs.writeFileSync(file, content);
}

function replaceCookies() {
  const file = "src/pages/Cookies.tsx";
  let content = fs.readFileSync(file, "utf8");
  
  // replace bg
  content = content.replace(
    'className="flex-1 bg-surface min-h-screen text-on-surface pb-24"',
    'className="flex-1 bg-transparent min-h-screen text-on-surface pb-24"'
  );
  
  // replace image src
  content = content.replace(
    'src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNm2HLjqWbCmeIQ8CL4M7kRUrRaLJ3rJned_WLrEtgJWunyIhBaQYl2KQGy26WkLNaUyXUNifaFltAmoRY4PPxIOUnEithCUKe611JWkfeU-ums-vc0mf2Z6hyPFW_nW8CnGt_nTBzXY3jIefolNjxMNsTGoNq1MsTrbsh6AyPizoejtDbL0byUjeQbfkMT4woWyD5XWh7W89K19IZ-2G_XLTi0SbuP2pbT45MUlGC3UfYm9Vo9qXeNnN95IOabEVVAjhv9NvuFLEm"',
    'src="/images/fondo_cookies.jpg"'
  );
  
  fs.writeFileSync(file, content);
}

function replacePrivacy() {
  const file = "src/pages/Privacy.tsx";
  let content = fs.readFileSync(file, "utf8");
  
  // replace image src
  content = content.replace(
    'src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5hi-pim59R9cW-YqUQUwB5IHssaqNzIcyC4vWvGU2BuewHVvGi7xENSJPdXL8yVD7ZyPxEKgI8-LoRPci77EyQTEFj8xnnfJTmgF_rQPr_eEhYpoxIUiArRN0Q2Yu1lSn3h7afwamrLPUwr468JgsTyj3WfVX0Tuh_9ExGJeRyeBt8MXqF6SAS1h5uFpXmpxxGFhhMJs-wEWtg5xDVqm4RjN4mictDtS6-_BcQPMiuD_1ZxITaJc6W9sMrqNSrlmPeyLzzKztcW2p"',
    'src="/images/fondo_privacidad.jpg"'
  );
  
  fs.writeFileSync(file, content);
}

replaceTerms();
replaceCookies();
replacePrivacy();

console.log("Replaced terms cookies and privacy");
