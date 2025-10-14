

export default function GenerateBlogPostButton() {


  function generateBlogPost() {
    shopify.toast.show("This is blog page", {duration: 2000, onDismiss: ()=> {}}); // Show success toast
  }

  return (
    <s-page heading="This is Blog Page">
      <s-button onClick={generateBlogPost}>Generate Blog Post</s-button>
      <s-button onClick={() => {
      shopify.toast.show('Success! 🎉', {duration: 2000, onDismiss: () => console.log('👋 Toast dismissed')})
    }}>Show toast</s-button>
    </s-page>
  );
}
