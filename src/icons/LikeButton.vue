<template>
  <svg 
    id="Layer_1" 
    data-name="Layer 1" 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    stroke-width="1.5" 
    width="24" 
    height="24" 
    :color="active ? '#4CAF50' : '#000000'"
    class="like-button"
  >
    <path 
      fill="none" 
      :stroke="active ? '#4CAF50' : '#000000'" 
      stroke-miterlimit="10" 
      d="M.5,12H5.28l6.11-7.06A2,2,0,0,0,12,3.51a2,2,0,0,1,2-2,2.74,2.74,0,0,1,2,.8,2.79,2.79,0,0,1,.8,2c0,2-2.87,5.86-2.87,5.86h6A2.61,2.61,0,0,1,22.5,12.7a2.94,2.94,0,0,1-.05.51L20.89,21A1.91,1.91,0,0,1,19,22.52H11.25a9.13,9.13,0,0,1-4-.95h0a9.08,9.08,0,0,0-4.06-1H.5"
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
.like-button {
  transition: all 0.3s ease;
  cursor: pointer;
}
</style>