<script>
    import StreamContainer from "/src/lib/components/streamContainer.svelte"
    import forge from "node-forge"
    import { onMount } from "svelte";
    const pki = forge.pki;

    //if (getCookie("certificate") !== ""){
    if (true) {
      // generate a keypair or use one you have already
      let keys = pki.rsa.generateKeyPair(2048);

      // create a new certificate
      let cert = pki.createCertificate();

      // fill the required fields
      cert.publicKey = keys.publicKey;
      cert.serialNumber = '01';
      cert.validity.notBefore = new Date();
      cert.validity.notAfter = new Date();
      cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

      // use your own attributes here, or supply a csr (check the docs)
      let attrs = [{
        name: 'commonName',
        value: 'Dani'
      }];

      // here we set subject and issuer as the same one
      cert.setSubject(attrs);
      cert.setIssuer(attrs);

      // the actual certificate signing
      cert.sign(keys.privateKey);

      // now convert the Forge certificate to PEM format
      let pem = pki.certificateToPem(cert);
      console.log(pem);

      //console.log(pki.certificateFromPem(pem).publicKey);

      console.log(keys.publicKey);

      setCookie("certificate", pem);
      setCookie("privateKey", keys.privateKey);
    }

    function setCookie(cname, cvalue) {
      onMount(() => {
        document.cookie = cname + "=" + cvalue + ";";
      })
    }

    function getCookie(cname) {
      onMount(() =>{
        let name = cname + "=";
        let ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) === ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
      })
    }

</script>

<div class="row" style="margin: 0;">
  <div class="row" style="padding:0; margin:0;">
    <StreamContainer />
    <StreamContainer />
  </div>
  <div class="row" style="padding:0; margin:0;">
    <StreamContainer />
    <StreamContainer />
  </div>
</div>
