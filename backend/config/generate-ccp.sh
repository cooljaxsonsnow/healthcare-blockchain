#!/bin/bash

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP1=$(one_line_pem $4)
    local PP2=$(one_line_pem $5)
    local PP3=$(one_line_pem $6)
    local PP4=$(one_line_pem $7)
    local CP=$(one_line_pem $8)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM1}#$PP1#" \
        -e "s#\${PEERPEM2}#$PP2#" \
        -e "s#\${PEERPEM3}#$PP3#" \
        -e "s#\${PEERPEM4}#$PP4#" \
        -e "s#\${CAPEM}#$CP#" \
        ./ccp-template.json
}

ORG1=patient
P0PORT1=7041
CAPORT1=7040
PEERPEM1=../../fablo-target/fabric-config/crypto-config/peerOrganizations/patient.healthcare.com/tlsca/tlsca.patient.healthcare.com-cert.pem
CAPEM1=../../fablo-target/fabric-config/crypto-config/peerOrganizations/patient.healthcare.com/tlsca/tlsca.patient.healthcare.com-cert.pem

ORG2=doctor
P0PORT2=7061
CAPORT2=7060
PEERPEM2=../../fablo-target/fabric-config/crypto-config/peerOrganizations/doctor.healthcare.com/tlsca/tlsca.doctor.healthcare.com-cert.pem
CAPEM2=../../fablo-target/fabric-config/crypto-config/peerOrganizations/doctor.healthcare.com/tlsca/tlsca.doctor.healthcare.com-cert.pem

ORG3=facility
P0PORT3=7081
CAPORT3=7080
PEERPEM3=../../fablo-target/fabric-config/crypto-config/peerOrganizations/facility.healthcare.com/tlsca/tlsca.facility.healthcare.com-cert.pem
CAPEM3=../../fablo-target/fabric-config/crypto-config/peerOrganizations/facility.healthcare.com/tlsca/tlsca.facility.healthcare.com-cert.pem

ORG4=entity
P0PORT4=7101
CAPORT4=7100
PEERPEM4=../../fablo-target/fabric-config/crypto-config/peerOrganizations/entity.healthcare.com/tlsca/tlsca.entity.healthcare.com-cert.pem
CAPEM4=../../fablo-target/fabric-config/crypto-config/peerOrganizations/entity.healthcare.com/tlsca/tlsca.entity.healthcare.com-cert.pem

echo "$(json_ccp $ORG1 $P0PORT1 $CAPORT1 $PEERPEM1 $PEERPEM2 $PEERPEM3 $PEERPEM4 $CAPEM1)" > connection-profile-patient.json

echo "$(json_ccp $ORG2 $P0PORT2 $CAPORT2 $PEERPEM1 $PEERPEM2 $PEERPEM3 $PEERPEM4 $CAPEM2)" > connection-profile-doctor.json

echo "$(json_ccp $ORG3 $P0PORT3 $CAPORT3 $PEERPEM1 $PEERPEM2 $PEERPEM3 $PEERPEM4 $CAPEM3)" > connection-profile-facility.json

echo "$(json_ccp $ORG4 $P0PORT4 $CAPORT4 $PEERPEM1 $PEERPEM2 $PEERPEM3 $PEERPEM4 $CAPEM4)" > connection-profile-entity.json