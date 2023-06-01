# BCI App

Mobile phone application interface for the python BCI at University of Miami
Neural Interfaces Laboratory

## Getting started

``` bash
# Create the conda environment
conda env create

# Activate conda enviornment
conda activate bciapp

# Update to latest node package manager
npm install -g npm@latest

# enable conda environment specific variables
ENV_DIR=$(conda env list | grep "*" | sed -Ee s/[^\/]+//)
mkdir -p ${ENV_DIR}/etc/activate.d
printf '#!/bin/bash\n\nexport CXXFLAGS="--std=c++14"' > ${ENV_DIR}/etc/activate.d/activate.sh

# Install dependencies
npm install

# Check health (only write ios or android to check the specific platform)
ns doctor <ios|android>

# Build the application
ns build <ios|android> --device <DEVICEID>

# Update cocoapod build files
PODFILE=$(find . -name *Pods*.sh)
sed -Ee '/readlink/s/readlink[^$]+/readlink -f /i' $PODFILE > $PODFILE

# Build, watch for changes and debug the application
ns run <ios|android> --device <DEVICEID>

# Build for production
ns build <platform> --env.production

```
