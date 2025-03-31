<template>
  <svg 
    id="Layer_1" 
    data-name="Layer 1" 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    stroke-width="1.5" 
    width="24" 
    height="24" 
    :color="active ? '#F44336' : '#000000'"
    class="dislike-button"
  >
    <path 
      fill="none" 
      :stroke="active ? '#F44336' : '#000000'" 
      stroke-miterlimit="10" 
      d="M.5,12H5.28l6.11,7.06A2,2,0,0,1,12,20.49a2,2,0,0,0,2,2,2.74,2.74,0,0,0,2-.8,2.79,2.79,0,0,0,.8-1.95c0-2-2.87-5.86-2.87-5.86h6A2.61,2.61,0,0,0,22.5,11.3a2.94,2.94,0,0,0-.05-.51L20.89,3A1.91,1.91,0,0,0,19,1.48H11.25a9.13,9.13,0,0,0-4,1h0a9.08,9.08,0,0,1-4.06,1H.5"
    />
  </svg>
</template>

<script>
export default {
  props: {
    active: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped>
.dislike-button {
  transition: all 0.3s ease;
  cursor: pointer;
}
</style>