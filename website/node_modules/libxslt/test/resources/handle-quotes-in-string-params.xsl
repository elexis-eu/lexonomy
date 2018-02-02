<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="text" omit-xml-declaration="yes" indent="no"/>
  
  <xsl:template match="root">
    strParam:<xsl:value-of select="$strParam"/>
  </xsl:template>

</xsl:stylesheet>
