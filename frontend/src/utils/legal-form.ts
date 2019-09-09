let legalForm: any;

const all = async () => {
  if (!legalForm) {
    const response = await fetch('/legal-form.json');
    legalForm = await response.json();
  }

  return legalForm;
};

export default {
  all,
};
