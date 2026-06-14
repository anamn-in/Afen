from setuptools import setup, find_packages

setup(
    name="afen-client",
    version="1.0.0",
    description="Afen Python SDK – capture and send runtime errors to Afen",
    packages=find_packages(where="."),
    package_dir={"": "."},
    install_requires=["requests>=2.28.0"],
    python_requires=">=3.8",
    author="Afen Contributors",
    license="MIT",
)